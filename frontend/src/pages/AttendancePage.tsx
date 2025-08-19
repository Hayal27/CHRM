import React, { useState } from 'react';
import { Card, Button, message } from 'antd';
import AttendanceDetails from '../components/attendance/AttendanceDetails.tsx';

const AttendancePage: React.FC = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);

  const handleClockIn = () => {
    if (!clockedIn) {
      const now = new Date();
      setClockedIn(true);
      setClockInTime(now.toLocaleTimeString());
      message.success(`Clocked in at ${now.toLocaleTimeString()}`);
    } else {
      message.info('Already clocked in.');
    }
  };

  const handleClockOut = () => {
    if (clockedIn && !clockOutTime) {
      const now = new Date();
      setClockOutTime(now.toLocaleTimeString());
      setClockedIn(false);
      message.success(`Clocked out at ${now.toLocaleTimeString()}`);
    } else if (!clockedIn) {
      message.warning('Please clock in first.');
    } else {
      message.info('Already clocked out.');
    }
  };

  return (
    <Card title="Attendance">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={handleClockIn} disabled={clockedIn}>
          Clock In
        </Button>
        <Button type="default" onClick={handleClockOut} disabled={!clockedIn || !!clockOutTime}>
          Clock Out
        </Button>
        <span>
          {clockInTime && <strong>Clock In Time:</strong>} {clockInTime || ''}
          {clockOutTime && <span style={{ marginLeft: 16 }}><strong>Clock Out Time:</strong> {clockOutTime}</span>}
        </span>
      </div>
      <AttendanceDetails />
    </Card>
  );
};

export default AttendancePage;
