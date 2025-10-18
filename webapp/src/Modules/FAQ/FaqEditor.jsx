import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import BlueGoldButton from 'Common/Button/BlueGoldButton';
import { httpGet, httpPost } from 'Services/APIService';
import { API_BASE_URL } from 'Config/config';

const FAQ_ENDPOINT = '/faq';

const FaqEditor = () => {
  const [faqs, setFaqs] = useState([]);
  const [showNotification, _] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '' });

  useEffect(() => {
    const fetchFaqs = async () => {
      const faq = await httpGet(API_BASE_URL + FAQ_ENDPOINT, true);
      if (faq && faq.faqData) setFaqs(faq.faqData);
    };
    fetchFaqs();
  }, []);

  const handleAddClick = () => {
    setForm({ question: '', answer: '' });
    setShowAddModal(true);
  };

  const handleEditClick = (index) => {
    setForm({ question: faqs[index].question, answer: faqs[index].answer });
    setCurrentEditIndex(index);
    setShowEditModal(true);
  };

  const handleDelete = async (index) => {
    const updated = [...faqs];
    updated.splice(index, 1);
    setFaqs(updated);
    await httpPost(API_BASE_URL + FAQ_ENDPOINT, { faqData: updated });
  };

  const handleAddSave = async () => {
    setFaqs([...faqs, form]);
    setShowAddModal(false);
    await httpPost(API_BASE_URL + FAQ_ENDPOINT, { faqData: [...faqs, form] });
  };

  const handleEditSave = async () => {
    const updated = [...faqs];
    updated[currentEditIndex] = form;
    setFaqs(updated);
    setShowEditModal(false);
    await httpPost(API_BASE_URL + FAQ_ENDPOINT, { faqData: updated });
  };

  // const handleSaveAll = async () => {
  // await httpPost(API_ENDPOINT + FAQ_API_URI, { faqData: faqs });
  //     setShowNotification(true);
  //     setTimeout(() => setShowNotification(false), 3000);
  // };

  return (
    <Container>
      <Header>
        <Title>FAQ Manager</Title>
        <Actions>
          <BlueGoldButton text="Add FAQ" clickHandler={handleAddClick} />
          {/* <BlueGoldButton text="Save All" clickHandler={handleSaveAll} /> */}
        </Actions>
      </Header>

      <FaqList>
        {faqs.map((faq, index) => (
          <FaqCard key={index}>
            <Question>{faq.question}</Question>
            <Answer>{faq.answer}</Answer>
            <ButtonRow>
              <SmallButton onClick={() => handleEditClick(index)}>Edit</SmallButton>
              <SmallButton onClick={() => handleDelete(index)}>Delete</SmallButton>
            </ButtonRow>
          </FaqCard>
        ))}
      </FaqList>

      {showNotification && <Notification>FAQs saved successfully!</Notification>}

      {(showAddModal || showEditModal) && (
        <ModalOverlay>
          <ModalBox>
            <h3>{showAddModal ? 'Add FAQ' : 'Edit FAQ'}</h3>
            <label htmlFor="question">Question</label>
            <Input
              id="question"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter question"
            />
            <label htmlFor="answer">Answer</label>
            <Textarea
              id="answer"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Enter answer"
            />
            <ModalActions>
              <BlueGoldButton
                text="Save"
                clickHandler={showAddModal ? handleAddSave : handleEditSave}
              />
              <BlueGoldButton
                text="Cancel"
                clickHandler={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
              />
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default FaqEditor;

const Container = styled.div`
  padding: 24px;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  color: #161032;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FaqCard = styled.div`
  padding: 16px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const Question = styled.h4`
  margin: 0 0 8px;
  color: #161032;
`;

const Answer = styled.p`
  margin: 0 0 12px;
  color: #555;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button`
  background: #e2c044;
  border: none;
  padding: 6px 10px;
  color: #161032;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: #d2b03c;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  border-radius: 5px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Textarea = styled.textarea`
  padding: 10px;
  min-height: 80px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;
