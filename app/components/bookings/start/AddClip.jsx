import React, { useState } from 'react'
// import Modal from '../../../common/modal';
import { useAppDispatch } from '../../../store';
import { traineeAction } from '../../trainee/trainee.slice';
import { Utils } from '../../../../utils/utils';
import { X } from 'react-feather';
import { Button, Modal, ModalBody } from 'reactstrap';


const AddClip = ({isOpen, onClose , trainer, selectedClips, clips, setSelectedClips, shareFunc }) => {

  const [selectedClipsCopy, setSelectedClipsCopy] = useState([])
  const dispatch = useAppDispatch();
  const { removeNewBookingData } = traineeAction;

  return (
    <Modal isOpen={isOpen} className="react-strap-modal-full">
      <ModalBody style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
          <div className="theme-title">
            <div className="media">
              <div className="media-body media-body text-right">
                <div
                  className="icon-btn btn-sm btn-outline-light close-apps pointer"
                  onClick={() => {
                    onClose();
                    dispatch(removeNewBookingData());
                  }}
                >
                  {" "}
                  <X />{" "}
                </div>
              </div>
            </div>
          </div>
          <div className="container media-gallery portfolio-section grid-portfolio ">
            <h2 className="my-5">
              Feel free to share upto 2 clips with the{" "}
              {trainer}
            </h2>
            {selectedClipsCopy?.length ? (
              <div>
                <h5 className="block-title p-0">
                  {" "}
                  Selected Clips
                  <label className="badge badge-primary sm ml-2">
                    {selectedClipsCopy?.length}
                  </label>
                </h5>
                <div className={`block-content`}>
                  <div className="row d-flex justify-content-center">
                    {selectedClipsCopy?.map((clp) => (
                      <div
                        key={clp?._id}
                        style={{
                          borderRadius: 5,
                          position: "relative",
                          border: "1px solid #ebebeb",
                          marginLeft: "15px",
                        }}
                        className={`col-4`}
                      >
                        <video
                          poster={Utils.generateThumbnailURL(clp)}
                          style={{
                            height: "180px",
                            width: "100% !important",
                            border: "4px solid #b4bbd1",
                            borderRadius: "5px",
                            objectFit: "cover",
                          }}
                        >
                          <source
                            src={Utils?.generateVideoURL(clp)}
                            type="video/mp4"
                          />
                        </video>
                        <span
                          style={{
                            position: "absolute",
                            right: -5,
                            top: -3,
                            cursor: "pointer",
                            background: "red",
                            borderRadius: "50%",
                            padding: "0px 6px",
                            color: "#fff",
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the event from bubbling up
                            const updatedVideos =
                              selectedClipsCopy.filter(
                                (video) => video._id !== clp?._id
                              );
                              setSelectedClipsCopy(updatedVideos);
                          }}
                        >
                          x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div style={{ marginTop: "30px" }}></div>
            {clips?.length ? (
              clips?.map((cl, ind) => (
                <div
                  className={`collapse-block ${cl?.show ? "" : "open"
                    }`}
                >
                  <h5 className="block-title pb-0">
                    {" "}
                    {cl?._id}
                    <label className="badge badge-primary sm ml-2">
                      {cl?.clips?.length}
                    </label>
                  </h5>
                  <div>
                    <div className="row d-flex justify-content-center">
                      {cl?.clips.map((clp, index) => {
                        var sld = selectedClipsCopy.find(
                          (val) => val?._id === clp?._id
                        );
                        return (
                          <div
                            key={index}
                            className={`col-4 `}
                            style={{ borderRadius: 5, }}
                            onClick={() => {
                              if (
                                !sld &&
                                selectedClipsCopy?.length < 2
                              ) {
                                setSelectedClipsCopy( prev => [
                                  ...prev,clp
                                ]);
                              }
                            }}
                          >
                            <video
                              poster={Utils.generateThumbnailURL(clp)}
                              style={{
                                border: `${sld ? "4px solid green" : "4px solid #b4bbd1"}`,
                                height: "180px",
                                width: "100% !important",
                                borderRadius: "5px",
                                objectFit: "cover",
                              }}
                            >
                              <source
                                src={Utils?.generateVideoURL(clp)}
                                type="video/mp4"
                              />
                            </video>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "40px",
                  }}
                >
                  <h5 className="block-title"> No Data Found</h5>
                </div>
              </>
            )}
          </div>
          {clips?.length ? (
            <div className="d-flex justify-content-around w-100 p-3">
              <Button
                color="success"
                onClick={() => {
                  setSelectedClips(selectedClipsCopy);
                  shareFunc(selectedClipsCopy);
                }}
              >
                Share
              </Button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </ModalBody>
    </Modal>
  )
}

export default AddClip