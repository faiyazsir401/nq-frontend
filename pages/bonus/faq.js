import React, { useState } from "react";
import CommonLayout from "../common/commonLayout";
import {
	Row,
	Col,
	Container,
	Card,
	CardHeader,
	CardBody,
	Collapse,
} from "reactstrap";
import { Search, Plus, Minus } from "react-feather";
import Link from "next/link";
import { useMediaQuery } from "usehooks-ts";

const Faq = (props) => {
	const [openItems, setOpenItems] = useState(new Set());
	const [responsivesearch, setResponsiveSearch] = useState(false);
	const isMobileScreen = useMediaQuery("(max-width: 768px)");

	const toggleItem = (index) => {
		setOpenItems((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	};

	const SeacrhResposive = (responsivesearch) => {
		if (responsivesearch) {
			setResponsiveSearch(!responsivesearch);
			document.querySelector(".search-form").classList.add("open");
		} else {
			setResponsiveSearch(!responsivesearch);
			document.querySelector(".search-form").classList.remove("open");
			document.querySelector(".close-search").classList.remove("open");
		}
	};

	return (
		<CommonLayout title="FAQ" parent="home">
			<section className="section-py-space faq-section">
				<ul className="page-decore">
					<li className="top">
						<img
							className="img-fluid inner2"
							src="../assets/images/landing/footer/2.png"
							alt="footer-back-img"
						/>
					</li>
					<li className="bottom">
						<img
							className="img-fluid inner2"
							src="../assets/images/landing/footer/2.png"
							alt="footer-back-img"
						/>
					</li>
				</ul>
				<Container>
					<Row className="faq-block">
						<Col sm="12">
							<div className="media">
								<div>
									<h2>Frequently Asked Questions</h2>
									<p>
										Discover you question from underneath or present your
										inquiry fromt tahe submit box.
									</p>
								</div>
								<div className="media-body">
									<Link
										className="icon-btn btn-outline-primary btn-sm search contact-search float-right"
										href="#"
									>
										<Search onClick={() => SeacrhResposive(responsivesearch)} />
									</Link>
									<form className="form-inline search-form">
										<div className="form-group">
											<input
												className="form-control-plaintext"
												type="search"
												placeholder="Search.."
											/>
											<div
												className="icon-close close-search"
												onClick={() => SeacrhResposive(responsivesearch)}
											></div>
										</div>
									</form>
								</div>
							</div>
						</Col>
						<Col md="12">
							<div className="accordion theme-accordion" id="accordionExample1">
								{[
									{
										id: "headingOne",
										question: "How can I downgrade to an earlier ?",
										answer: "it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years,All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures",
									},
									{
										id: "headingTwo",
										question: "How can I upgrade from Shopify 2.5 to shopify 3?",
										answer: "it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years,All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures",
									},
									{
										id: "headingThree",
										question: "Under what license are Regular Labs released?",
										answer: "it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years,All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures",
									},
									{
										id: "headingFour",
										question: "What is the Regular Labs Library?",
										answer: "it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years,All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures",
									},
									{
										id: "headingFive",
										question: "Can I turn on/off some blocks on the page?",
										answer: "it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years,All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures",
									},
									{
										id: "headingSix",
										question: "What is included in the theme package?",
										answer: "it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years,All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures",
									},
								].map((faq, index) => {
									const isOpen = openItems.has(index);
									return (
								<Card
											key={faq.id}
											className="faq-block accordion theme-accordion mb-3"
											style={{
												border: "1px solid #e0e0e0",
												borderRadius: "8px",
												boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
											}}
										>
											<CardHeader
												id={faq.id}
												className="faq-header"
												style={{
													backgroundColor: "#f8f9fa",
													cursor: "pointer",
													padding: isMobileScreen ? "15px" : "20px",
													borderBottom: isOpen ? "1px solid #e0e0e0" : "none",
												}}
												onClick={() => toggleItem(index)}
											>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														justifyContent: "space-between",
													}}
												>
													<h5
														className="mb-0"
														style={{
															fontSize: isMobileScreen ? "16px" : "18px",
															fontWeight: 600,
															color: "#000080",
															flex: 1,
															marginRight: "15px",
															textAlign: "left",
														}}
											>
														{faq.question}
										</h5>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															minWidth: "30px",
															height: "30px",
															backgroundColor: "#000080",
															borderRadius: "50%",
															color: "white",
															flexShrink: 0,
														}}
													>
														{isOpen ? <Minus size={18} /> : <Plus size={18} />}
													</div>
												</div>
									</CardHeader>
											<Collapse isOpen={isOpen}>
												<CardBody
													style={{
														padding: isMobileScreen ? "15px" : "20px",
														fontSize: isMobileScreen ? "14px" : "16px",
														lineHeight: "1.6",
														color: "#333",
													}}
												>
											<p>
												<img
													className="img-fluid faq-decor"
													src="../assets/images/landing/chitchat/2.png"
													alt="chit-chat-back-img"
												/>
														{faq.answer}
											</p>
										</CardBody>
									</Collapse>
								</Card>
									);
								})}
							</div>
						</Col>
					</Row>
				</Container>
			</section>
		</CommonLayout>
	);
};

export default Faq;
