import React from "react";


const recentStudent = ()=>{
    return(
        <div className="Content-Trainer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <div className="card rounded trainer-profile-card Select Recent Student" style={{ width: '25%', marginTop: '32px', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}>
          <div className="card-body">
            <div style={{ justifyContent: 'center' }}>
              <h2 className="Recent-Heading" style={{ textAlign: 'center' }}>Recent Students</h2>
            </div>
            <div className="row" style={{ justifyContent: 'center', paddingTop: '15px' }}>
              <div className="image-gallery" style={{ display: 'flex', flexWrap: 'wrap', paddingTop: '15px', width: '85%', justifyContent: 'space-between', overflowY: 'auto', maxHeight: '75vh' }}>
                <img src="/assets/images/about/Coach.jpeg" alt="Student 1" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                <img src="/assets/images/about/Coach.jpeg" alt="Student 1" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                <img src="/assets/images/about/Coach.jpeg" alt="Student 2" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                <img src="/assets/images/about/Coach.jpeg" alt="Student 1" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                <img src="/assets/images/about/Coach.jpeg" alt="Student 1" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                <img src="/assets/images/about/Coach.jpeg" alt="Student 2" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />

                <img src="/assets/images/about/Coach.jpeg" alt="Student 2" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                <img src="/assets/images/about/Coach.jpeg" alt="Student 1" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                <img src="/assets/images/about/Coach.jpeg" alt="Student 2" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                <img src="/assets/images/about/Coach.jpeg" alt="Student 1" style={{ width: '8vw', height: '20vh', marginBottom: '10px', marginRight: '10px' }} />
                {/* Add more images as needed */}
                {images.map((index) => (
                  <img
                    key={index}
                    src={`/assets/images/about/Coach${index + 1}.jpeg`}
                    alt={`Student ${index + 1}`}
                    style={{
                      width: '8vw',
                      height: '20vh',
                      marginBottom: '10px',
                      flexGrow: '0',
                      flexShrink: '0',
                      flexBasis: 'calc(33.3333% - 20px)', // 33.3333% for 3 images in a row with 20px margin
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Additional content for Recent Students section can be added here */}
          </div>
        </div>
      </div>

    )
}
export default recentStudent;