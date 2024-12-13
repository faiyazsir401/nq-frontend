import React, { useState } from 'react';
import Modal from '../../../common/modal';
import { useAppDispatch } from '../../../store';
import { traineeAction } from '../../trainee/trainee.slice';
import { Utils } from '../../../../utils/utils';
import { X } from 'react-feather';
import { Button } from 'reactstrap';
import { useMediaQuery } from 'usehooks-ts';

const AddClip = ({ isOpen, onClose, trainer, selectedClips, clips, setSelectedClips, shareFunc  }) => {

  const [selectedClipsCopy, setSelectedClipsCopy] = useState([]);
  const dispatch = useAppDispatch();
  const { removeNewBookingData } = traineeAction;
  const isMobileScreen = useMediaQuery("(max-width:1000px)")
  
  const allClips = clips.reduce((acc, category) => {
    return acc.concat(category.clips);
  }, []);


  const midIndex = Math.ceil(allClips.length / 2);
  const firstRowClips = allClips.slice(0, midIndex);
  const secondRowClips = allClips.slice(midIndex);
  console.log("firstRowClips",firstRowClips)
  return (
    <Modal isOpen={isOpen} overflowHidden element={
      <div className='d-flex justify-content-center align-items-center flex-column' style={{width:'100%' , height:'100%'}}>
        <div className='d-flex flex-row-reverse align-items-center'>
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
             
            }}
          >
            {clips?.length ? (
               Array.from({ length: 5 }, () =>
              
           
              
                <div
                  className={`d-inline `}
                  style={{ display: 'inline-block'}}
                >
                  <div className='d-flex' style={{ gap: 10 }}>
                    {firstRowClips.map((clp, index) => {
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
                              height: isMobileScreen?"100px":"200px",
                              width: isMobileScreen?"150px":"300px",
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
                  <div className='d-flex' style={{ gap: 10 }}>
                    {secondRowClips.map((clp, index) => {
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
                              height: isMobileScreen?"100px":"200px",
                              width: isMobileScreen?"150px":"300px",
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
              )
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
