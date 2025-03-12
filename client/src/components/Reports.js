import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Row, Col } from 'antd';
import moment from 'moment';
import resources from "../resources";

const Reports = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
  const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    axios.get('/api/bookings/reports/booked')
      .then(response => {
        setData(response.data);
      })
      .catch(error => console.error(resources.reports.errorFetchingRoomBookingsReport, error));
  }, []);

  useEffect(() => {
    fetchMonthBookings();
  }, [selectedMonth, selectedYear]);

  const fetchMonthBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/reports/bookings-by-month', {
        params: { month: selectedMonth, year: selectedYear }
      });

      const bookings = response.data;
      if (bookings.length === 0) {
        setNoData(true);
        setFilteredData([]);
        return;
      }

      const roomNights = bookings.reduce((acc, booking) => {
        const nights = moment(booking.todate, 'DD-MM-YYYY').diff(moment(booking.fromdate, 'DD-MM-YYYY'), 'days');
        if (!acc[booking.room]) {
          acc[booking.room] = 0;
        }
        acc[booking.room] += nights;
        return acc;
      }, {});

      const formattedData = Object.keys(roomNights).map(room => ({
        name: room,
        value: roomNights[room]
      }));

      setFilteredData(formattedData);
      setNoData(false);
    } catch (error) {
      console.error(resources.reports.errorFetchingBookingsByMonthReport, error);
    }
  };

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', 
    '#FF19A3', '#19FFB0', '#B019FF', '#FFD719', '#19FFA3',
    '#FF5733', '#C70039', '#900C3F', '#581845', '#1ABC9C'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p className="label" style={{ margin: 0 }}>{`${payload[0].name} : ${payload[0].value}`}</p>
          <p className="intro" style={{ margin: 0 }}>{label === resources.reports.reportByBookings ? resources.reports.bookings :  resources.reports.bookings} </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltip2 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p className="label" style={{ margin: 0 }}>{`${payload[0].name} : ${payload[0].value}`}</p>
          <p className="intro" style={{ margin: 0 }}>{label === resources.reports.reportByNights ? resources.reports.nights : resources.reports.nights}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
      <Row gutter={16} style={{ width: '100%' }}>
        <Col span={12} style={{ textAlign: 'center' }}>
          <h2>{resources.reports.reportByBookings}</h2>
          <PieChart width={600} height={600}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={200}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip label={resources.reports.reportByBookings} />} />
            <Legend />
          </PieChart>
        </Col>
        
        <Col span={12} style={{ textAlign: 'center' }}>
          <h2>{resources.reports.reportByNights}</h2>
          {noData ? (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <h3>{resources.reports.noDates}</h3>
            </div>
          ) : (
            <div style={{ marginBottom: 40 }}>
              <PieChart width={600} height={600}>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={200}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip2 label={resources.reports.reportByNights} />} />
            
                <Legend />
              </PieChart>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
