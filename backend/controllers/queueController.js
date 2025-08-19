const db = require('../models/db');

// Helper function queryPromise is no longer needed as db.query is already promise-based.

// --- PAYMENT RELATED FUNCTIONS ---
const initiatePayment = async (req, res) => {
    try {
        const { queueId, passengerName } = req.body;
        const userId = req.user ? req.user.user_id : null;

        if (!queueId || !passengerName || !passengerName.trim()) {
            return res.status(400).json({ message: 'Queue ID and passenger name are required.' });
        }

        // Fetch queue details by joining with tariff and vehicles tables
        const queueDetailSql = `
            SELECT
                q.status AS queue_status,
                t.price AS tariff_price,
                v.seatCapacity AS seat_capacity 
            FROM queue q
            JOIN tariff t ON q.tariff = t.id  -- Assuming queue.tariff_id links to tariff.id
            JOIN vehicles v ON q.vehicle_id = v.id -- Assuming queue.vehicle_id links to vehicles.id
            WHERE q.id = ?
        `;
        const queueResults = await db.query(queueDetailSql, [queueId]);

        if (!queueResults.length) {
            return res.status(404).json({ message: "Queue not found." });
        }
        const queueInfo = queueResults[0];

        // Calculate booked_seats
        const bookedSeatsSql = `
            SELECT COUNT(*) AS current_booked_seats
            FROM bookings
            WHERE queue_id = ? AND status NOT IN ('cancelled', 'failed', 'payment_failed', 'expired') 
            -- Consider statuses that mean a seat is taken or reserved (e.g., 'pending_payment', 'paid', 'confirmed')
        `;
        const bookedSeatsResults = await db.query(bookedSeatsSql, [queueId]);
        const current_booked_seats = bookedSeatsResults[0].current_booked_seats;

        if (queueInfo.queue_status !== 'active') {
            return res.status(400).json({ message: `Queue is not active. Current status: ${queueInfo.queue_status}` });
        }
        if (current_booked_seats >= queueInfo.seat_capacity) {
            return res.status(400).json({ message: "Queue is fully booked." });
        }

        const grossPrice = parseFloat(queueInfo.tariff_price);
        if (isNaN(grossPrice) || grossPrice <= 0) {
            return res.status(500).json({ message: "Invalid tariff price for the selected queue." });
        }

        const serviceCharge = grossPrice * 0.025;
        const transportBureauCharge = grossPrice * 0.005;
        const totalAmount = parseFloat((grossPrice - serviceCharge + transportBureauCharge).toFixed(2));
        const currency = 'ETB';

        const internalBookingId = `chapa_txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const bookingSql = `
            INSERT INTO bookings (internal_booking_id, queue_id, user_id, passenger_name, amount, currency, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending_payment', NOW(), NOW())
        `;
        await db.query(bookingSql, [internalBookingId, queueId, userId, passengerName.trim(), totalAmount, currency]);

        console.log(`Payment initiated for Queue: ${queueId}, Passenger: ${passengerName}, Amount: ${totalAmount} ${currency}, BookingID: ${internalBookingId}, UserID: ${userId || 'Guest'}`);

        res.status(200).json({
            internalBookingId: internalBookingId,
            totalAmount: totalAmount,
            currency: currency,
        });

    } catch (error) {
        console.error('Error in initiatePayment controller:', error);
        if (error.sql) console.error('Faulty SQL:', error.sql);
        res.status(500).json({ message: 'Server error during payment initiation.', details: error.message });
    }
};

const initiateMassPayment = async (req, res) => {
    try {
        const { queueId, passengerNames, count, totalAmount } = req.body; // totalAmount is pre-calculated by frontend for mass booking
        const userId = req.user ? req.user.user_id : null;

        if (!queueId || !passengerNames || !Array.isArray(passengerNames) || passengerNames.length === 0 || !count || count !== passengerNames.length || totalAmount === undefined) {
            return res.status(400).json({ message: 'Invalid input for mass payment.' });
        }

        // Fetch queue details by joining with tariff and vehicles tables
        const queueDetailSql = `
            SELECT
                q.status AS queue_status,
                v.seatCapacity AS seat_capacity
                -- t.price is not strictly needed here if totalAmount is pre-calculated and validated by frontend logic for mass booking
                -- However, it's good practice to verify, or at least fetch seat_capacity and status
            FROM queue q
            JOIN vehicles v ON q.vehicle_id = v.id -- Assuming queue.vehicle_id links to vehicles.id
            -- JOIN tariff t ON q.tariff = t.id -- If tariff_price validation is needed on backend for mass booking
            WHERE q.id = ?
        `;
        const queueResults = await db.query(queueDetailSql, [queueId]);

        if (!queueResults.length) {
            return res.status(404).json({ message: "Queue not found." });
        }
        const queueInfo = queueResults[0];

        // Calculate booked_seats
        const bookedSeatsSql = `
            SELECT COUNT(*) AS current_booked_seats
            FROM bookings
            WHERE queue_id = ? AND status NOT IN ('cancelled', 'failed', 'payment_failed', 'expired')
        `;
        const bookedSeatsResults = await db.query(bookedSeatsSql, [queueId]);
        const current_booked_seats = bookedSeatsResults[0].current_booked_seats;

        if (queueInfo.queue_status !== 'active') {
            return res.status(400).json({ message: `Queue is not active. Status: ${queueInfo.queue_status}` });
        }
        if ((current_booked_seats + count) > queueInfo.seat_capacity) {
            return res.status(400).json({ message: "Not enough available seats for mass booking." });
        }
        
        // Optional: Server-side validation of totalAmount based on queueInfo.tariff_price * count and applying charges
        // This would require fetching tariff.price in the queueDetailSql for mass payment as well.
        // For now, assuming frontend calculation of totalAmount is trusted or validated elsewhere.

        const internalBookingId = `chapa_batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const batchBookingSql = `
            INSERT INTO bookings (internal_booking_id, queue_id, user_id, passenger_name, amount, currency, status, is_mass_booking, ticket_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'ETB', 'pending_payment', TRUE, ?, NOW(), NOW())
        `;
        // passengerNames are not stored individually in this simplified mass booking insert, only the count.
        // If individual passenger names for mass bookings are needed, the schema and logic would be more complex.
        await db.query(batchBookingSql, [internalBookingId, queueId, userId, `Mass Booking (${count} tickets for ${passengerNames.join(', ')})`, totalAmount, count]);

        console.log(`Mass payment initiated for ${count} tickets. Batch ID: ${internalBookingId}, Amount: ${totalAmount}, UserID: ${userId || 'Guest'}`);

        res.status(200).json({ internalBookingId: internalBookingId });

    } catch (error) {
        console.error('Error in initiateMassPayment controller:', error);
        if (error.sql) console.error('Faulty SQL:', error.sql);
        res.status(500).json({ message: 'Server error during mass payment initiation.', details: error.message });
    }
};

// --- Stubs for other potential queue functions ---
const addQueue = (req, res) => res.status(501).json({ message: "Add Queue not implemented in queueController" });
const getVehicles = (req, res) => res.status(501).json({ message: "Get Vehicles not implemented in queueController" });
const getStations = (req, res) => res.status(501).json({ message: "Get Stations not implemented in queueController" });
const getSources = (req, res) => res.status(501).json({ message: "Get Sources not implemented in queueController" });
const getDestinations = (req, res) => res.status(501).json({ message: "Get Destinations not implemented in queueController" });

module.exports = {
    initiatePayment,
    initiateMassPayment,

    addQueue,
    getVehicles,
    getStations,
    getSources,
    getDestinations,
};
