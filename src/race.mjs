const [token, day = '2027-03-01'] = process.argv.slice(2);
const body = JSON.stringify({
  resource_id: 1,
  start_time: `${day}T10:00:00Z`,
  end_time: `${day}T11:00:00Z`,
});

const call = () =>
  fetch('http://localhost:3000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body,
  }).then((res) => res.status);

Promise.all(Array.from({ length: 5 }, call)).then((statuses) => console.log(statuses));