import React from 'react';
import { Container, Row, Col, Card, CardImg, CardBody, CardTitle, CardText } from 'reactstrap';

const teamMembers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Lead Trainer',
    image: 'https://randomuser.me/api/portraits/men/80.jpg',
    bio: 'John has over 10 years of experience in training and development. He specializes in leadership and management training.',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Senior Trainee',
    image: 'https://randomuser.me/api/portraits/men/27.jpg',
    bio: 'Jane is a dedicated trainee with a passion for continuous learning and professional growth. She excels in project management.',
  },
  {
    id: 3,
    name: 'Emily Johnson',
    role: 'Training Coordinator',
    image: 'https://randomuser.me/api/portraits/women/87.jpg',
    bio: 'Emily coordinates all training sessions and ensures that trainees have all the resources they need to succeed.',
  },


];

const AboutUs = () => {
  return (
    <Container className="about-us">
      <Row>
      <Col md="12" style={{display:"flex"}} className='mt-4 mb-2'>
      <div className="logo" style={{margin:"auto"}}>
          <img
            src="/assets/images/netquix_logo_beta.png"
            alt="logo"
            className="header-image-logo"
          />
        </div>
        </Col>
        <Col md="12">
          <p
            style={{
              fontSize: '16px',
              margin: '10px 0',
              fontWeight: '500',
              textAlign:"center"
            }}
            
          >
            NetQwix is a community where passionate Experts and Enthusiasts meet LIVE for “Qwick Sessions over the Net”
          </p>
          {/* <p
            style={{
              fontSize: '16px',
              margin: '10px 0',
              fontWeight: '500',
            }}
          >
            Our mission is to foster a collaborative and supportive environment where both trainers and trainees can thrive. We are committed to delivering high-quality training and development opportunities.
          </p> */}
        </Col>
      </Row>
      {/* <h2 className="mt-4 mb-4">Meet Our Team</h2>
      <Row>
        {teamMembers.map((member) => (
          <Col md="4" key={member.id} className="mb-4">
            <Card>
              <CardImg top width="100%" height={200} src={member.image} alt={member.name} />
              <CardBody>
                <CardTitle
                  tag="h5"
                  style={{
                    marginBottom: '0.25rem',
                    fontSize: '18px',
                  }}
                >
                  {member.name}
                </CardTitle>
                <CardText
                  style={{
                    fontWeight: '500',
                    margin: '5px 0',
                  }}
                >
                  {member.role}
                </CardText>
                <CardText
                  style={{
                    lineHeight: '1rem',
                  }}
                >
                  {member.bio}
                </CardText>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row> */}
    </Container>
  );
};

export default AboutUs;
