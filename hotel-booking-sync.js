/* ============================================================
   TOURSETU - HOTEL BOOKING TWO-WAY SYNC FIX
   Only affects Registered Hotel <-> Customer booking workflow.
   ============================================================ */
(function () {
    'use strict';

    const POLL_MS = 3000;
    let customerTimer = null;
    let hotelTimer = null;
    let customerSyncRunning = false;
    let hotelSyncRunning = false;

    function getClientSafe() {
        try {
            return typeof getClient === 'function' ? getClient() : null;
        } catch (e) {
            console.error('Hotel sync client error:', e);
            return null;
        }
    }

    async function getCurrentUser() {
        const client = getClientSafe();
        if (!client) return null;

        try {
            const { data: { user } } = await client.auth.getUser();
            return user || null;
        } catch (e) {
            console.error('Hotel sync auth error:', e);
            return null;
        }
    }

    /* ------------------------------------------------------------
       CUSTOMER SIDE
       When customer is viewing Registered Hotels -> My Requests,
       always re-fetch hotel_bookings so APPROVED / DENIED / CANCELLED
       changes appear without requiring a manual page refresh.
       ------------------------------------------------------------ */
    async function refreshCustomerHotelRequests() {
        if (customerSyncRunning) return;

        const container = document.getElementById('customer-pkg-list');
        const resultTitle = document.getElementById('result-title');
        if (!container || !resultTitle) return;

        const selectedType = document.querySelector(
            'input[name="search-type"]:checked'
        )?.value;

        if (selectedType !== 'hotel') return;

        customerSyncRunning = true;

        try {
            const client = getClientSafe();
            if (!client) return;

            const user = await getCurrentUser();
            if (!user) return;

            if (typeof window.renderCustomerRequests === 'function') {
                await window.renderCustomerRequests();
            }
        } catch (e) {
            console.error('Customer hotel booking sync error:', e);
        } finally {
            customerSyncRunning = false;
        }
    }

    function startCustomerHotelSync() {
        if (customerTimer) clearInterval(customerTimer);
        customerTimer = setInterval(refreshCustomerHotelRequests, POLL_MS);
    }

    /* ------------------------------------------------------------
       HOTEL OWNER SIDE
       When Arrivals & Payout is open, re-fetch hotel_bookings so a
       customer cancellation appears automatically.
       This also works even if Supabase Realtime is unavailable.
       ------------------------------------------------------------ */
    async function refreshHotelArrivals() {
        if (hotelSyncRunning) return;

        const list = document.getElementById('hotel-arrivals-payout-list');
        if (!list) return;

        hotelSyncRunning = true;

        try {
            const user = await getCurrentUser();
            if (!user) return;

            if (typeof renderArrivalsAndPayouts === 'function') {
                await renderArrivalsAndPayouts(
                    document.getElementById('hotel-main-content'),
                    user
                );
            }
        } catch (e) {
            console.error('Hotel arrivals sync error:', e);
        } finally {
            hotelSyncRunning = false;
        }
    }

    function startHotelBookingSync() {
        if (hotelTimer) clearInterval(hotelTimer);
        hotelTimer = setInterval(refreshHotelArrivals, POLL_MS);
    }

    /* ------------------------------------------------------------
       REALTIME + POLLING FALLBACK
       ------------------------------------------------------------ */
    function startRealtimeFallbackSync() {
        const client = getClientSafe();
        if (!client) return;

        try {
            if (window.__toursetuHotelBookingSyncChannel) {
                client.removeChannel(window.__toursetuHotelBookingSyncChannel);
            }

            window.__toursetuHotelBookingSyncChannel = client
                .channel('toursetu-hotel-booking-two-way-sync')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'hotel_bookings'
                    },
                    async function (payload) {
                        console.log(
                            '⚡ Hotel booking sync update:',
                            payload?.eventType || 'UPDATE'
                        );

                        await refreshCustomerHotelRequests();
                        await refreshHotelArrivals();
                    }
                )
                .subscribe();
        } catch (e) {
            console.warn(
                'Hotel booking realtime unavailable; polling fallback remains active.',
                e
            );
        }
    }

    /* ------------------------------------------------------------
       SAFETY OVERRIDES
       Do not change existing booking fields or other workflows.
       These wrappers only refresh the opposite dashboard after the
       existing database mutation succeeds.
       ------------------------------------------------------------ */
    const originalApprove = window.approveCustomerHotelBooking;
    if (typeof originalApprove === 'function') {
        window.approveCustomerHotelBooking = async function (bookingId) {
            await originalApprove(bookingId);
            await refreshCustomerHotelRequests();
        };
    }

    const originalDeny = window.denyCustomerHotelBooking;
    if (typeof originalDeny === 'function') {
        window.denyCustomerHotelBooking = async function (bookingId) {
            await originalDeny(bookingId);
            await refreshCustomerHotelRequests();
        };
    }

    const originalCancel = window.confirmHotelCancellation;
    if (typeof originalCancel === 'function') {
        window.confirmHotelCancellation = async function (bookingId) {
            await originalCancel(bookingId);
            await refreshHotelArrivals();
        };
    }

    startCustomerHotelSync();
    startHotelBookingSync();
    startRealtimeFallbackSync();

    console.log('✅ TourSetu hotel booking two-way sync enabled.');
})();
