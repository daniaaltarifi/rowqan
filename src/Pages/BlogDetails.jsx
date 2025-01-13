import { Container, Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../App";
function BlogDetails() {
  const { id } = useParams();
  const lang = location.pathname.split("/")[1] || "en";
  const [blogs, setBlogs] = useState([]);
  const fetchData = useCallback(async () => {
    try {
      const blogRes = await axios.get(
        `${API_URL}/Blogs/getBlogById/${id}/${lang}`
      );
      if (blogRes.data !== blogs) {
        setBlogs(blogRes.data);
      }
    } catch (error) {
      console.error("Error fetching blogets:", error);
    }
  }, [lang, blogs]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [lang]);
  return (
    <div>
      <Container>
        {blogs.map((blog) => (
          <Row key={blog.id}>
            <Col
              lg={12}
              md={6}
              sm={12}
              className="d-flex justify-content-center"
            >
              <img
                srcSet={`https://res.cloudinary.com/dqimsdiht/${blog.image}?w=400&f_auto&q_auto:eco 400w`}
                alt="blog"
                style={{ borderRadius: "25px", height: "500px",width:"100%" }}
              />
            </Col>
            <Col
              lg={12}
              md={6}
              sm={12}
              className="d-flex flex-column justify-content-center align-items-center"
            >
              <div style={{ width: "120vh" }}>
                <h1 className="mt-4" style={{ textAlign: "center" }}>
                  {blog.title}
                </h1>
                <p className="mt-5">{blog.description}</p>
              </div>
            </Col>
          </Row>
        ))}
      </Container>
    </div>
  );
}

export default BlogDetails;