lucide.createIcons();

// SETTINGS
const MAX_CLASSIC = 10;
const MAX_ELECTRIC = 5;
let bookings = []; // This stores all confirmed rentals

// Navigation Logic
function showPage(page) {
    document.getElementById('page-booking').classList.toggle('hidden', page !== 'booking');
    document.getElementById('page-calendar').classList.toggle('hidden', page !== 'calendar');
    if(page === 'calendar') calendar.render(); 
}

// Initialize Calendar
const calendarEl = document.getElementById('calendar');
const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' },
    events: [] // Will be populated from bookings array
});

// Booking Logic
document.getElementById('rental-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const type = document.getElementById('bike-type').value;
    const hours = parseInt(document.getElementById('duration').value);
    const start = new Date(document.getElementById('start-time').value);
    const end = new Date(start.getTime() + (hours * 60 * 60 * 1000));
    const limit = (type === 'classic') ? MAX_CLASSIC : MAX_ELECTRIC;

    // 1. Business Hours Check
    if (start.getHours() < 10 || start.getHours() >= 19) {
        alert("Select a time between 10:00 AM and 7:00 PM");
        return;
    }

    // 2. Overbooking Check (The "Brain")
    const overlapping = bookings.filter(b => {
        return b.type === type && (start < b.end && end > b.start);
    });

    if (overlapping.length >= limit) {
        alert(`❌ SORRY: All ${type} bikes are already booked for this time slot.`);
        return;
    }

    // 3. Success - Save Booking
    const newEvent = {
        title: `${type.toUpperCase()} Bike Rental`,
        start: start,
        end: end,
        type: type,
        backgroundColor: type === 'electric' ? '#eab308' : '#3b82f6',
        borderColor: 'transparent'
    };

    bookings.push(newEvent);
    calendar.addEvent(newEvent);
    
    alert(`✅ Booked! You are user #${overlapping.length + 1} for this slot.`);
    showPage('calendar');
});
