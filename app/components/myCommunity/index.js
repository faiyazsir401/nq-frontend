import React from "react";
import {
  Card,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Container,
  Row,
  Col,
} from "reactstrap";
import './index.css';
const MyCommunity = () => {
  const fakeData = [
    {
      id: 1,
      title: "Community Post 1",
      text: "This is a brief description of community post 1.",
      image: "https://picsum.photos/seed/picsum/200/200",
    },
    {
      id: 2,
      title: "Community Post 2",
      text: "This is a brief description of community post 2.",
      image: "https://picsum.photos/seed/picsum/200/200",
    },
    {
      id: 3,
      title: "Community Post 3",
      text: "This is a brief description of community post 3.",
      image: "https://picsum.photos/seed/picsum/200/200",
    },
    {
      id: 4,
      title: "Community Post 4",
      text: "This is a brief description of community post 3.",
      image: "https://picsum.photos/seed/picsum/200/200",
    },
    {
      id: 5,
      title: "Community Post 5",
      text: "This is a brief description of community post 3.",
      image: "https://picsum.photos/seed/picsum/200/200",
    },
    {
      id: 6,
      title: "Community Post 6",
      text: "This is a brief description of community post 3.",
      image: "https://picsum.photos/seed/picsum/200/200",
    },
  ];

  return (
    <Container className="community">
      {/* <h1
      style={{
        margin : '15px 0',
        textAlign : ''
      }}>Community Page</h1> */}
      <p
        style={{
          fontSize: "18px",
          margin: "20px 0",
          fontWeight: "500",
          textAlign : 'center'
        }}
      >
        Welcome to our community page! Explore the latest updates, workshops, and projects.
      
      </p>
      <Row
      style={{
        marginTop : "50px"
      }}
      >
        {fakeData.map((post) => (
          <Col 
           key={post.id} sm={12} md={6} lg={4} className="mb-4">
            <Card className="community-card">
              <div>
              <CardImg
                top
                width="100%"
                height={200}
                src={post.image}
                alt={post.title}
                className="card-img"
              />
              </div>
              <CardBody
              style={{
                padding : "1rem 0.5rem"
              }}>
                <div style={{ display: "flex" }}>
                  <img
                    width="50"
                    height="50"
                    src={post.image}
                    alt="User"
                    style={{ borderRadius: "50%", marginRight: "10px" }}
                  />
                  <div>
                    {/* <CardTitle tag="h5"
                    style={{
                        marginBottom : "0.25rem"
                    }}>username</CardTitle> */}
                    <CardTitle tag="h6"
                    style={{
                        marginBottom : "0.25rem",
                        fontSize : '13px',
                        fontWeight : "bold"
                    }}
                    >{post.title}</CardTitle>
                    <CardText
                    style={{
                        lineHeight : '1rem'
                    }}>{post.text}</CardText>
                  </div>
                </div>
                {/* <Button color="primary">Read More</Button> */}
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MyCommunity;
