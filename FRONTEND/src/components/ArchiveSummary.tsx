export const saveVisit = (data) => {
const visits = JSON.parse(localStorage.getItem('visits')) || []
visits.push(data)
localStorage.setItem('visits', JSON.stringify(visits))
}