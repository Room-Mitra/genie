import React, { useState } from "react";
import styled from "styled-components";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import "chart.js/auto";

const Container = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #333;
`;

const ExportButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Filter = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
`;

const KPIContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const KPICard = styled.div`
  flex: 1;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  margin: 0 10px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const KPITitle = styled.h3`
  color: #555;
  margin-bottom: 10px;
`;

const KPIValue = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  background-color: ${(props) => (props.active ? "#007bff" : "#f9f9f9")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border: none;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ChartContainer = styled.div`
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HotelAnalyticsDashboard = () => {
    const [activeTab, setActiveTab] = useState("Guest Requests");

    // Dummy data for charts
    const lineChartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
            {
                label: "Requests over time",
                data: [10, 20, 30, 40, 50],
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
            },
        ],
    };

    const barChartData = {
        labels: ["Service A", "Service B", "Service C"],
        datasets: [
            {
                label: "Most Requested Services",
                data: [30, 20, 10],
                backgroundColor: ["#007bff", "#28a745", "#ffc107"],
            },
        ],
    };

    const pieChartData = {
        labels: ["Service", "Info", "Entertainment"],
        datasets: [
            {
                data: [50, 30, 20],
                backgroundColor: ["#007bff", "#28a745", "#ffc107"],
            },
        ],
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "Guest Requests":
                return (
                    <ChartGrid>
                        <ChartContainer>
                            <h3>Requests Over Time</h3>
                            <Line data={lineChartData} />
                        </ChartContainer>
                        <ChartContainer>
                            <h3>Most Requested Services</h3>
                            <Bar data={barChartData} />
                        </ChartContainer>
                    </ChartGrid>
                );
            case "Staff Performance":
                return (
                    <ChartGrid>
                        <ChartContainer>
                            <h3>Staff Response Times</h3>
                            <Bar data={barChartData} />
                        </ChartContainer>
                        <ChartContainer>
                            <h3>Completed vs Pending Requests</h3>
                            <Doughnut data={pieChartData} />
                        </ChartContainer>
                    </ChartGrid>
                );
            case "Revenue Impact":
                return (
                    <ChartGrid>
                        <ChartContainer>
                            <h3>Upsells via Alexa</h3>
                            <Bar data={barChartData} />
                        </ChartContainer>
                        <ChartContainer>
                            <h3>Average Revenue per Guest</h3>
                            <Line data={lineChartData} />
                        </ChartContainer>
                    </ChartGrid>
                );
            case "Alexa Engagement":
                return (
                    <ChartGrid>
                        <ChartContainer>
                            <h3>Top Used Alexa Features</h3>
                            <Bar data={barChartData} />
                        </ChartContainer>
                        <ChartContainer>
                            <h3>Type of Interactions</h3>
                            <Pie data={pieChartData} />
                        </ChartContainer>
                    </ChartGrid>
                );
            default:
                return null;
        }
    };

    return (
        <Container>
            <Header>
                <Title>Hotel Analytics Dashboard</Title>
                <ExportButton>Export to CSV</ExportButton>
            </Header>

            {/* Filters */}
            <Filters>
                <Filter>
                    <option>Date Range</option>
                    <option>Last Week</option>
                    <option>Last Month</option>
                    <option>Last Year</option>
                </Filter>
                <Filter>
                    <option>Department</option>
                    <option>Housekeeping</option>
                    <option>Room Service</option>
                    <option>Front Desk</option>
                </Filter>
                <Filter>
                    <option>Room Number</option>
                    <option>101</option>
                    <option>102</option>
                    <option>103</option>
                </Filter>
            </Filters>

            {/* KPI Cards */}
            <KPIContainer>
                <KPICard>
                    <KPITitle>Total Guest Requests</KPITitle>
                    <KPIValue>120</KPIValue>
                </KPICard>
                <KPICard>
                    <KPITitle>Average Service Time</KPITitle>
                    <KPIValue>15 mins</KPIValue>
                </KPICard>
                <KPICard>
                    <KPITitle>Total Upsell Revenue</KPITitle>
                    <KPIValue>$3,000</KPIValue>
                </KPICard>
                <KPICard>
                    <KPITitle>Alexa Interactions per Guest</KPITitle>
                    <KPIValue>5</KPIValue>
                </KPICard>
            </KPIContainer>

            {/* Tabs */}
            <Tabs>
                <Tab
                    active={activeTab === "Guest Requests"}
                    onClick={() => setActiveTab("Guest Requests")}
                >
                    Guest Requests
                </Tab>
                <Tab
                    active={activeTab === "Staff Performance"}
                    onClick={() => setActiveTab("Staff Performance")}
                >
                    Staff Performance
                </Tab>
                <Tab
                    active={activeTab === "Revenue Impact"}
                    onClick={() => setActiveTab("Revenue Impact")}
                >
                    Revenue Impact
                </Tab>
                <Tab
                    active={activeTab === "Alexa Engagement"}
                    onClick={() => setActiveTab("Alexa Engagement")}
                >
                    Alexa Engagement
                </Tab>
            </Tabs>

            {/* Tab Content */}
            {renderTabContent()}
        </Container>
    );
};

export default HotelAnalyticsDashboard;