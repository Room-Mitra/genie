import React, { useState } from "react";
import styled from "styled-components";


const FaqEditor = () => {
    // List of FAQ types/questions
    const [faqs, setFaqs] = useState([
        { question: "Pool Timings", answer: "" },
        { question: "Breakfast Buffet Options", answer: "" },
        { question: "Parking Availability", answer: "" },
        { question: "Check-in and Check-out Policy", answer: "" },
        { question: "Gym Facilities", answer: "" }
    ]);

    // Notification state for save action
    const [showNotification, setShowNotification] = useState(false);

    // Handle change of individual answers
    const handleAnswerChange = (index, newAnswer) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index].answer = newAnswer;
        setFaqs(updatedFaqs);
    };

    // Handle save all action
    const handleSaveAll = () => {
        console.log("Saved FAQs:", faqs); // For debugging or sending to backend
        setShowNotification(true);

        // Hide notification after 3 seconds
        setTimeout(() => setShowNotification(false), 3000);
    };

    return (
        <Container>
            {/* Header Section */}
            <Header>
                <Title>FAQ Editor</Title>
                <SaveButton onClick={handleSaveAll}>Save All</SaveButton>
            </Header>

            {/* Full Width Editable Answers */}
            <AnswersContainer>
                <SectionTitle>Answers</SectionTitle>
                {faqs.map((faq, index) => (
                    <AnswerItem key={index}>
                        <Label>{faq.question}</Label>
                        <TextArea
                            value={faq.answer}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder={`Enter answer for "${faq.question}"`}
                        />
                    </AnswerItem>
                ))}
            </AnswersContainer>

            {/* Notification Popup */}
            {showNotification && (
                <Notification>Data has been saved successfully!</Notification>
            )}
        </Container>
    );
};

export default FaqEditor;



const Container = styled.div`
    display: flex;
    flex-direction: column;
    font-family: 'Arial', sans-serif;
    margin: 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const Title = styled.h2`
    color: #333;
`;

const SaveButton = styled.button`
    background-color: #161032;
    color: #e2c044;
    font-weight: bold;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        opacity: 0.9;
    }
`;

const AnswersContainer = styled.div`
    background-color: #fff;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow-y: auto;
`;

const SectionTitle = styled.h3`
    color: #333;
    margin-bottom: 10px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
`;

const AnswerItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 15px;
`;

const Label = styled.label`
    font-weight: bold;
    color: #555;
`;

const TextArea = styled.textarea`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    resize: none;
    height: 60px;
    font-size: 14px;
`;

const Notification = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;