import React, { useState } from 'react';
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Dropdown,
} from 'react-bootstrap';
import { majors } from '../assets/constants';
import { miscIcons, profileIcons } from '../assets/icons/all';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectUser,
  selectUserDraft,
  setUserDraft,
} from '../redux/slices/auth';
import { logout, editProfile } from '../redux/slices/auth';
import Image from 'react-bootstrap/Image';
import { User, dummyUser } from '../assets/models/User';

interface PathProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

const phoneFormat = (phone: string, previousPhone: string) => {
  const phoneRegex = /\d+/;
  const charArray = [];
  const limit = 14;
  var i;
  for (i = 0; i < Math.min(phone.length, limit); i++) {
    if (phone[i].match(phoneRegex)) {
      charArray.push(phone[i]);
    }
  }
  if (
    previousPhone.length > phone.length && // if it is a delete operation
    phone.length > 0 && // if it is non empty
    !previousPhone[previousPhone.length - 1].match(phoneRegex)
  ) {
    charArray.pop();
  }
  const bracket = charArray.length >= 3;
  const space = charArray.length > 3;
  const horizontal = charArray.length > 6;
  if (horizontal) {
    charArray.splice(6, 0, '-');
  }
  if (space) {
    charArray.splice(3, 0, ' ');
  }
  if (bracket) {
    charArray.splice(0, 0, '(');
    charArray.splice(4, 0, ')');
  }
  return charArray.join('');
};

// Will only be called during confirmation
const generateUpdates = (original: User, draft: User) => {
  const updatePairs: { [k: string]: any } = {};
  const updateKeys = (Object.keys(original) as Array<keyof User>).filter(
    (key) => original[key] !== draft[key],
  );
  updateKeys.forEach((key) => (updatePairs[key] = draft[key]));
  return updatePairs;
};

const ProfileModal: React.FC<PathProps> = ({ show, setShow }) => {
  const userSelected = useSelector(selectUser) || dummyUser;
  const userSelectedDraft = useSelector(selectUserDraft) || dummyUser;
  const dispatch = useDispatch();
  const [activeIndicator, setactiveIndicator] = useState(true);
  return (
    <Modal
      dialogClassName="wizard-form-modal-dialog"
      show={show}
      onHide={() => setShow(false)}
      centered
    >
      <div className="h-100 w-100">
        {/* TODO add border-radius to top and bottom rows */}
        <div className="profile-form-top-bar">
          <Button
            variant="no-show"
            className="mr-auto"
            onClick={() => setShow(false)}
          >
            <miscIcons.orangeX />
          </Button>
          <span className="title mr-auto ml-auto">Edit Profile</span>
        </div>

        {/* TODO <div className="d-flex align-items-center justify-content-around h-100"> */}
        <div className="profile-form-middle">
          <Container>
            <Row>
              <Col md={4} className="profile-info align-self-center">
                <div className="profile-wrap mb-2">
                  <Image
                    src={
                      'https://houseit.s3.us-east-2.amazonaws.com/ambar%40ucsd.edu/profile/Mask+Group-1.jpg'
                    }
                    roundedCircle
                    className="profile-icon"
                  />
                </div>
                <div className="profile-name">Jacob Jones</div>
                <div className="profile-verified">
                  <profileIcons.tickMark />
                  UCSD Email Verified
                </div>
                <div className="profile-wrap">
                  <Button
                    className="profile-sign-out"
                    variant="no-show"
                    onClick={() => {
                      dispatch(logout());
                      setShow(false);
                    }}
                  >
                    Log Out
                  </Button>
                </div>
                <div className="mt-5 profile-edit-wrap profile-wrap">
                  {activeIndicator ? (
                    <Button
                      variant="secondary"
                      onClick={() => setactiveIndicator(false)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div>
                      <div>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const updates = generateUpdates(
                              userSelected,
                              userSelectedDraft,
                            );
                            // if nothing changes upon confirm, no need to send to backend
                            if (
                              !(
                                Object.keys(updates).length === 0 &&
                                updates.constructor === Object
                              )
                            ) {
                              dispatch(
                                editProfile(
                                  userSelected.email,
                                  userSelectedDraft,
                                  generateUpdates(
                                    userSelected,
                                    userSelectedDraft,
                                  ),
                                  setactiveIndicator,
                                ),
                              );
                            } else {
                              setactiveIndicator(true);
                            }
                            // TODO: display error if fails at backend
                          }}
                        >
                          Confirm
                        </Button>
                      </div>
                      <div className="mt-1 profile-wrap">
                        <Button
                          className="profile-cancel"
                          variant="no-show"
                          onClick={() => {
                            setactiveIndicator(true);
                            dispatch(setUserDraft(userSelected));
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Col>
              <Col md={8}>
                <Form.Row className="justify-content-center m-2 my-4">
                  <Form.Group as={Col} controlId="profileEmail">
                    <Form.Label className="profile-form-label">
                      School Email
                    </Form.Label>
                    <Form.Control
                      className="single-line-input"
                      type="email"
                      disabled
                      value={userSelectedDraft.email}
                    ></Form.Control>
                  </Form.Group>
                  <Form.Group as={Col} controlId="profilePhone">
                    <Form.Label className="profile-form-label">
                      Phone
                    </Form.Label>
                    <Form.Control
                      readOnly={activeIndicator}
                      className="single-line-input"
                      type="text"
                      value={userSelectedDraft.phone}
                      onChange={(event) => {
                        console.log(userSelected, 'hello');
                        const previousPhone = userSelectedDraft.phone;
                        dispatch(
                          setUserDraft({
                            ...userSelectedDraft,
                            phone: phoneFormat(
                              event.target.value,
                              previousPhone,
                            ),
                          }),
                        );
                      }}
                    ></Form.Control>
                  </Form.Group>
                </Form.Row>
                <Form.Row className="m-2">
                  <Form.Group as={Col} controlId="profileMajor">
                    <Form.Label className="profile-form-label">
                      Major
                    </Form.Label>
                    <Form.Control
                      as={Dropdown}
                      readOnly={activeIndicator}
                      className="single-line-input d-flex py-0 pr-0"
                      type="text"
                      value={userSelectedDraft.major}
                    >
                      <Button variant="no-show" className="single-line-input">
                        {userSelectedDraft.major}
                      </Button>
                      <Dropdown.Toggle
                        className="ml-auto h-100 profile-drop"
                        variant="success"
                        id="dropdown-major"
                      />
                      <Dropdown.Menu className="w-100 profile-drop-content">
                        {majors.map((major) => (
                          <Dropdown.Item
                            active={major === userSelectedDraft.major}
                            eventKey={major}
                            onSelect={(event) =>
                              dispatch(
                                setUserDraft({
                                  ...userSelectedDraft,
                                  major: event || '',
                                }),
                              )
                            }
                          >
                            {major}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Form.Control>
                  </Form.Group>
                </Form.Row>
                <Form.Row className="m-2">
                  <Form.Group as={Col} controlId="profileBio">
                    <Form.Label className="profile-form-bio">
                      Tell us about yourself in a short bio
                    </Form.Label>
                    <Form.Control
                      readOnly={activeIndicator}
                      as="textarea"
                      className="single-line-input profile-bio-text"
                      type="text"
                      maxLength={600}
                      value={userSelectedDraft.description}
                      onChange={(event) =>
                        dispatch(
                          setUserDraft({
                            ...userSelectedDraft,
                            description: event.target.value,
                          }),
                        )
                      }
                    ></Form.Control>
                    <span className="profile-char-check">
                      {userSelectedDraft.description.length}/600
                    </span>
                  </Form.Group>
                </Form.Row>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
