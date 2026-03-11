// Initialize Icons
lucide.createIcons();

// Configuration
const FLEET_LIMITS = { classic: 10, electric: 5 };
let calendar;

// 1. Load data from LocalStorage or start empty
let bookings = JSON.parse(localStorage.getItem('bike_bookings')) || [];

// 2. Navigation
function showPage(pageId) {
    document.querySelectorAll('.page-container').forEach(p => p.classList.add('hidden'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');
    
    if (pageId === 'calendar') {
        initCalendar();
    }
}

// 3. Initialize Calendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar-el');
    if (calendar) calendar.destroy(); // Refresh calendar if it exists

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek', // Best view for hourly rentals
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: bookings.map(b => ({
            title: b.type.toUpperCase(),
            start: b.start,
            end: b.end,
            backgroundColor: b.type === 'electric' ? '#eab308' : '#3b82f6',
            borderColor: 'transparent'
        }))
    });
    calendar.render();
}

// 4. Booking Logic
document.getElementById('rental-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const type = document.getElementById('bike-type').value;
    const hours = parseInt(document.getElementById('duration').value);
    const startInput = document.getElementById('start-time').value;
    const start = new Date(startInput);
    const end = new Date(start.getTime() + (hours * 60 * 60 * 1000));

    // Time Constraint (10 AM - 7 PM)
    const startHour = start.getHours();
    if (startHour < 10 || startHour >= 19) {
        alert("Please select a start time between 10:00 AM and 7:00 PM.");
        return;
    }

    // Overbooking Logic: Count how many of this type are already out during this specific time
    const activeRentals = bookings.filter(b => {
        if (b.type !== type) return false;
        const bStart = new Date(b.start);
        const bEnd = new Date(b.end);
        // Standard overlap formula: (StartA < EndB) and (EndA > StartB)
        return (start < bEnd && end > bStart);
    });

    if (activeRentals.length >= FLEET_LIMITS[type]) {
        alert(`❌ SORRY: All ${type} bikes are booked for this time period. Try another time.`);
        return;
    }

    // Success: Add to Array
    const newBooking = {
        type: type,
        start: start.toISOString(),
        end: end.toISOString()
    };

    bookings.push(newBooking);
    localStorage.setItem('bike_bookings', JSON.stringify(bookings));
    
    alert(`✅ SUCCESS: ${type.toUpperCase()} bike reserved!`);
    showPage('calendar');
});

function clearBookings() {
    if(confirm("Delete all rental data?")) {
        localStorage.removeItem('bike_bookings');
        bookings = [];
        initCalendar();
    }
}
