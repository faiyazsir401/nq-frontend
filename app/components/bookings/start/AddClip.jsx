import React, { useState } from 'react';
import Modal from '../../../common/modal';
import { useAppDispatch } from '../../../store';
import { traineeAction } from '../../trainee/trainee.slice';
import { Utils } from '../../../../utils/utils';
import { X } from 'react-feather';
import { Button } from 'reactstrap';

const AddClip = ({ isOpen, onClose, trainer, selectedClips, clips, setSelectedClips, shareFunc }) => {

  const [selectedClipsCopy, setSelectedClipsCopy] = useState([]);
  const dispatch = useAppDispatch();
  const { removeNewBookingData } = traineeAction;

  return (
    <Modal isOpen={isOpen} element={
      <div>
        <div className='d-flex flex-row-reverse'>
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
                  <X />
                </div>
              </div>
            </div>
          </div>
          <div className="container media-gallery portfolio-section grid-portfolio ">
            <h2 className="my-3 mb-4">
              Feel free to share up to 2 clips with the{" "}
              {trainer}
            </h2>
          </div>
        </div>
        <div className='container media-gallery portfolio-section grid-portfolio '>
          <div
            className='d-flex'
            style={{
              gap: 10,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              height: '200px',
            }}
          >
            {clips?.length ? (
              clips.map((cl, ind) => (
                <div
                  key={ind}
                  className={`d-inline ${cl?.show ? "" : "open"}`}
                  style={{ display: 'inline-block' }}
                >
                  <div className='d-flex' style={{ gap: 10 }}>
                    {cl?.clips.map((clp, index) => {
                      const isSelected = selectedClipsCopy.some(
                        (val) => val?._id === clp?._id
                      );
                      return (
                        <div
                          key={index}
                          style={{ borderRadius: 5 }}
                          onClick={() => {
                            if (isSelected) {
                              // Remove clip if it's already selected
                              setSelectedClipsCopy((prev) =>
                                prev.filter((val) => val?._id !== clp?._id)
                              );
                            } else if (selectedClipsCopy.length < 2) {
                              // Add clip if not selected and less than 2 selected
                              setSelectedClipsCopy((prev) => [...prev, clp]);
                            }
                          }}
                        >
                          <video
                            poster={Utils.generateThumbnailURL(clp)}
                            style={{
                              border: `${isSelected ? "4px solid green" : "4px solid #b4bbd1"}`,
                              height: "180px",
                              width: "300px",
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
              ))
            ) : null}
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
          ) : null}
        </div>
      </div>
    } />
  );
}

export default AddClip;
