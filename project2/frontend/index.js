// This is the frontEnd that modifies the HTML page directly
// event-based programming,such as document load, click a button


// Constants for API base URLs
const LOCAL_API_BASE_URL = 'http://localhost:5050';
// const PUBLIC_API_BASE_URL = 'http://141.217.210.187:5050';
const PUBLIC_API_BASE_URL = 'http://35.16.1.228:5050';

// Choose the API base URL based on the environment
const API_BASE_URL = window.location.hostname === 'localhost' ? LOCAL_API_BASE_URL : PUBLIC_API_BASE_URL;
// alert(window.location.hostname)

// load check session
document.addEventListener('DOMContentLoaded', async () => {
    const guestSection = document.getElementById('guest-section');
    const welcomeMessage = document.getElementById('welcome-message');
    
    try {
        const token = localStorage.getItem('authToken');
        
        // If there's no token, show the guest message and don't attempt to authenticate
        if (!token) {
            guestSection.innerHTML = '<h3>Please Sign In</h3><p>You need to sign in to access this section. Log in to continue.</p>';
            localStorage.setItem('isLoggedIn', 'false');
            return;
        }
        
        // If there is a token, attempt to authenticate
        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await fetch(API_BASE_URL + '/authenticateJWT', {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });
        
        //handle response
        if (!response.ok) {
            if (response.status === 401) { // Check if the token is expired
                showAlert('Your session has expired. Please log in again.', 'failure');
                localStorage.removeItem('authToken'); // Clear the expired token
                localStorage.setItem('isLoggedIn', 'false');
                guestSection.innerHTML = '<h3>Please Sign In</h3><p>You need to sign in to access this section. Log in to continue.</p>';
                return;
            } else {
                throw new Error('Failed to check session');
            }
        }
        
        const data = await response.json();
        
        if (data.loggedIn) {
            const user = data.user;
            welcomeMessage.innerHTML = `<h3>Welcome, ${user.firstName}</h3><p>You're logged in and ready to go. Explore all the features available to you!</p>`;
            localStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('user', JSON.stringify(user));
            toggleSignInStatus(true);
        } else {
            guestSection.innerHTML = '<h3>Please Sign In</h3><p>You need to sign in to access this section. Log in to continue.</p>';
            localStorage.setItem('isLoggedIn', 'false');
        }
    } catch (error) {
        console.error('Error:', error);
        guestSection.innerHTML = '<h1>Error checking session</h1>';
    }
});


// Function to fetch address on page load
function initAutocomplete() {
    const addressInput = document.getElementById("address");
    const suggestionsContainer = document.getElementById("address-suggestions");
    
    addressInput.addEventListener("input", function () {
        const query = addressInput.value;
        
        if (query.length < 3) {
            suggestionsContainer.innerHTML = ''; // Clear suggestions if the query is too short
            return;
        }
        
        suggestionsContainer.innerHTML = '<div>Loading...</div>';
        
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`)
        .then(response => response.json())
        .then(data => {
            suggestionsContainer.innerHTML = '';
            data.forEach(item => {
                const suggestion = document.createElement("div");
                suggestion.textContent = item.display_name;
                suggestion.style.fontSize = '12px'; 
                suggestion.style.cursor = 'pointer';
                suggestion.style.padding = '4px';
                suggestion.style.borderBottom = '1px solid #ddd';
                
                suggestion.addEventListener("click", () => {
                    addressInput.value = item.display_name;
                    suggestionsContainer.innerHTML = '';
                });
                
                suggestionsContainer.appendChild(suggestion);
            });
            
            if (data.length === 0) {
                suggestionsContainer.innerHTML = '<div>No suggestions found</div>';
            }
        })
        .catch(() => {
            suggestionsContainer.innerHTML = '<div>Error fetching suggestions</div>';
        });
    });
}

window.onload = initAutocomplete;


// Show alert function
function showAlert(message, type) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const pageContent = document.getElementById('page-content'); 
    
    alertMessage.textContent = message; 
    alertBox.classList.remove('hidden'); 
    alertBox.classList.add('show'); 
    
    // Clear existing alert type classes
    alertBox.classList.remove('alert-success', 'alert-failure');
    
    
    if (type === 'success') {
        alertBox.classList.add('alert-success'); 
    } else if (type === 'failure') {
        alertBox.classList.add('alert-failure');
    }
    
    // Automatically close the alert after 5 seconds
    setTimeout(() => {
        closeAlert();
    }, 5000);
}

function closeAlert() {
    const alertBox = document.getElementById('custom-alert');
    const pageContent = document.getElementById('page-content'); 
    alertBox.classList.remove('show'); 
    alertBox.classList.add('hidden'); 
    
    // Reset styles to default after closing
    alertBox.classList.remove('alert-success', 'alert-failure');
}

//show password
document.addEventListener('DOMContentLoaded', () => {
    const togglePasswordVisibility = (inputId, iconElement) => {
        const passwordInput = document.getElementById(inputId);
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        iconElement.textContent = passwordInput.type === 'text' ? '🙈' : '👁️';
    };
    
    // Event listeners for toggle icons
    ['toggle-signup-password', 'toggle-signin-password'].forEach(id => {
        document.getElementById(id).addEventListener('click', function () {
            togglePasswordVisibility(id === 'toggle-signup-password' ? 'signup-password' : 'signin-password', this);
        });
    });
});



// Function to render the correct menu based on user type
function renderMenu() {
    const contractorMenu = `
        <h2 class="section-title">Contractor Dashboard</h2>
        <nav class="menu">
            <ul>
                <li><a href="#" onclick="toggleSubMenu(event, 'quote-requests')">Quote Requests</a>
                    <ul class="submenu" id="quote-requests">
                        <li><a href="#" onclick="viewNewRequests(1)">View Urgency Requests</a></li>
                        <li><a href="#" id="viewUrgencyRequestsLink" onclick="viewNewRequests(2)">View All Requests</a></li>
                    </ul>
                </li>
                <li><a href="#" onclick="toggleSubMenu(event, 'work-orders')">Work Orders</a>
                    <ul class="submenu" id="work-orders">
                        <li><a href="#" onclick="manageOrders()">Manage Orders</a></li>
                        <li><a href="#" onclick="viewActiveOrders(1)">View Active Orders</a></li>
                        <li><a href="#" onclick="viewActiveOrders(2)">View Completed Orders</a></li>
                    </ul>
                </li>
                <li><a href="#" onclick="toggleSubMenu(event, 'billing')">Billing</a>
                    <ul class="submenu" id="billing">
                        <li><a href="#" onclick="generateBill()">Generate Bill</a></li>
                        <li><a href="#" onclick="viewAllBills()">View All Bills</a></li>
                        <li><a href="#" onclick="manageDisputes()">Manage Disputes</a></li>
                    </ul>
                </li>
                <li><a href="#" onclick="toggleSubMenu(event, 'reports')">Reports</a>
                    <ul class="submenu" id="reports">
                        <li><a href="#" onclick="viewRevenueReport()">Revenue Report</a></li>
                        <li><a href="#" onclick="viewBigClients()">List of Big Clients</a></li>
                        <li><a href="#" onclick="viewOverdueBills()">Overdue Bills</a></li>
                        <li><a href="#" onclick="viewClientRatings()">Good and Bad Clients</a></li>
                    </ul>
                </li>
            </ul>
        </nav>
    `;
    
    const clientMenu = `
        <h2 class="section-title">Client Dashboard</h2>
        <nav class="menu">
            <ul>
                <li><a href="#" onclick="toggleSubMenu(event, 'request-quote')">Request a Quote</a>
                    <ul class="submenu" id="request-quote">
                        <li><a href="#" onclick="viewMyRequests()">View My Requests</a></li>
                        <li><a href="#" onclick="submitNewRequest()">Submit New Request</a></li>
                    </ul>
                </li>
                <li><a href="#" onclick="toggleSubMenu(event, 'orders')">Orders</a>
                    <ul class="submenu" id="orders">
                        <li><a href="#" onclick="viewMyOrders()">View My Orders</a></li>
                        <li><a href="#" onclick="manageNegotiations()">Manage Order Negotiations</a></li>
                    </ul>
                </li>
                <li><a href="#" onclick="toggleSubMenu(event, 'billing')">Billing</a>
                    <ul class="submenu" id="billing">
                        <li><a href="#" onclick="viewBills()">View Bills</a></li>
                        <li><a href="#" onclick="payBill()">Pay Bill</a></li>
                        <li><a href="#" onclick="disputeBill()">Dispute Bill</a></li>
                    </ul>
                </li>
                <li><a href="#" onclick="toggleSubMenu(event, 'account-management')">Account Management</a>
                    <ul class="submenu" id="account-management">
                        <li><a href="#" onclick="viewProfile()">View Profile</a></li>
                        <li><a href="#" onclick="viewPaymentHistory()">View Payment History</a></li>
                    </ul>
                </li>
            </ul>
        </nav>
    `;
    
    const menuContainer = document.getElementById("menu-container");
    const formContainer = document.getElementById('formContainer');
    
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // If not logged in, display a message or hide the menu
    if (isLoggedIn !== 'true') {
        formContainer.innerHTML = `<div style="text-align: center;">
        <video width="100%" height="auto" controls autoplay muted loop>
        <source src="gwen.mp4" type="video/mp4">
        <source src="gwen.webm" type="video/webm">
        <source src="gwen.ogg" type="video/ogg">
        Your browser does not support the video tag.
        </video>
        </div>`;
        
    } else {
        // User is logged in, proceed with fetching user data
        const userData = JSON.parse(sessionStorage.getItem('user'));
        
        // If userData exists, proceed
        if (userData) {
            const userType = userData.user_type; 
            
            console.log("User Type:", userType); 
            
            // Render the menu based on user type
            if (userType === 2) {
                menuContainer.innerHTML = contractorMenu;  // Display contractor menu
                
                // Simulate click on the default "View Urgency Requests" link
                const urgencyRequestLink = document.getElementById('viewUrgencyRequestsLink');
                if (urgencyRequestLink) {
                    urgencyRequestLink.click();  // Simulate click
                }
            } else if (userType === 3) {
                menuContainer.innerHTML = clientMenu;  // Display client menu
                
                // Open the "Request a Quote" submenu by default
                const requestQuoteSubMenu = document.getElementById('request-quote');
                if (requestQuoteSubMenu) {
                    requestQuoteSubMenu.style.display = 'block';  // Ensure the submenu is displayed
                }
                
                // Open the "View My Requests" by default (similar to clicking on it)
                const viewMyRequestsLink = requestQuoteSubMenu.querySelector('a');
                if (viewMyRequestsLink) {
                    // Trigger the function for "View My Requests" on page load
                    viewMyRequestsLink.click();
                }
            } else {
                menuContainer.innerHTML = "<div><h1 style='text-align:center'>Not a valid user</h1></div>";
            }
        } else {
            // If userData is not available, prompt to log in
            menuContainer.innerHTML = "<div><h1 style='text-align:center'>Please log in to view this content.</h1></div>";
        }
    }
    
}

// Function to toggle the visibility of submenu when clicking on a parent link
function toggleSubMenu(event, submenuId) {
    event.preventDefault();  // Prevent the default link action
    
    const submenu = document.getElementById(submenuId);
    const allSubmenus = document.querySelectorAll('.submenu');
    
    // Close all submenus
    allSubmenus.forEach(sub => {
        if (sub !== submenu) {
            sub.classList.remove('active');  // Remove active class to hide it
        }
    });
    
    // Toggle the clicked submenu
    submenu.classList.toggle('active');  // Toggle the 'active' class to show or hide it
}

// Define functions for each action triggered by the menu links
// contractor
function viewNewRequests(type) {
    console.log("Viewing Quote Requests...");
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const userId = userData.userId;
    
    fetch(API_BASE_URL + '/new_requests/'+ type, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('table');
        document.getElementById('formContainer').style.display = 'none';
        document.getElementById('table').style.display = 'block';
        
        if (data && data.length > 0) {
            let tableHTML = `
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Client Name</th>
                        <th>Service</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Owned by</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
            data.forEach(request => {
                tableHTML += `
                    <tr>
                        <td>${request.request_id}</td>
                        <td>${request.client_name || 'N/A'}</td>
                        <td>${request.service_name || 'N/A'}</td>
                        <td>${request.urgency || 'N/A'}</td>
                        <td>${request.status || 'N/A'}</td>
                        <td>${request.owner_name || 'No Owner'}</td>
                        <td>${!request.owner_name ? 
                `<button onclick="handleRequestAction(${request.request_id},1)">Take Ownership</button>` : 
                (request.owned_by === userId ? 
                    `<button onclick="handleRequestAction(${request.request_id},2)">Remove Ownership</button>` : 
                    `<span>Already Taken</span>`)
                }
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += `</tbody>`;
            table.innerHTML = tableHTML;
        } else {
            table.innerHTML = '<tr><td colspan="6">No new requests found.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Error fetching new requests:', error);
        showAlert('Error', 'There was an error fetching new requests. Please try again later.', 'failure');
    });
}

function handleRequestAction(requestId, action_type) {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const userId = userData.userId;
    
    if (!userId) {
        showAlert('Authentication Error', 'User not authenticated. Please log in again.', 'failure');
        return;
    }
    
    fetch(API_BASE_URL + '/take_ownership', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({ requestId, userId, action_type })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to take ownership');
        return response.json();
    })
    .then(result => {
        showAlert(`Success, ${result.message}`, 'success');
        viewNewRequests(); // Refresh the table to show the updated ownership
    })
    .catch(error => {
        console.error('Error taking action:', error);
        showAlert('Error', 'Failed to take action. Please try again later.', 'failure');
    });
}

function manageOrders() {
    console.log("Managing Work Orders...");
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const userId = userData.userId;
    
    fetch(API_BASE_URL + '/manage_orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        },
        body: JSON.stringify({ userId }) // Sending userId in the body of the request
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('table');
        document.getElementById('formContainer').style.display = 'none';
        document.getElementById('table').style.display = 'block';
        
        if (data && data.length > 0) {
            let tableHTML = `
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Request ID</th>
                        <th>Accepted Date</th>
                        <th>Status</th>
                        <th>Quote Note</th>
                        <th>Counter Price</th>
                        <th>Time Window</th>
                        <th>Manage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
            data.forEach(order => {
                // Formatting the time window as 'Start - End'
                const timeWindow = `${new Date(order.time_window_start).toISOString().split('T')[0]} - ${new Date(order.time_window_end).toISOString().split('T')[0]}`;
                
                tableHTML += `<tr>
                            <td>${order.order_id}</td>
                            <td>${order.request_id}</td>
                            <td>${new Date(order.accepted_date).toLocaleDateString()}</td>
                            <td>${order.status}</td>
                            <td>${order.response_note || 'N/A'}</td>
                            <td>${order.counter_price || 'N/A'}</td>
                            <td>${timeWindow}</td>
                            <td>
                            <button onclick="manageQuote(
                            ${order.request_id}, 
                            '${order.response_note || ''}', 
                            '${order.counter_price || ''}', 
                            '${order.time_window_start || ''}', 
                            '${order.time_window_end || ''}')">
                            Quote
                            </button>
                            </td>
                            <td>
                            ${order.status === 'In Progress' ? 
                            `<button onclick="updateOrderStatus(${order.order_id}, 'Completed')">Mark as Completed</button>` : 
                            (order.status === 'Completed' ? 
                            `<span>Completed</span>` : 
                            `<button onclick="updateOrderStatus(${order.order_id}, 'Cancelled')">Cancel</button>`)}
                            </td>
                            </tr>`;
                    
                });
                
                tableHTML += `</tbody>`;
                table.innerHTML = tableHTML;
            } else {
                table.innerHTML = '<tr><td colspan="10">No orders found.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            showAlert('Error', 'There was an error fetching orders. Please try again later.', 'failure');
        });
    }
    
    function updateOrderStatus(orderId, status) {
        // Show confirmation for changing status
        if (confirm(`Are you sure you want to mark this order as ${status}?`)) {
            fetch(API_BASE_URL + '/update_order_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                body: JSON.stringify({
                    orderId: orderId,
                    status: status
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Order ${status} successfully.`);
                    manageOrders();  // Reload the orders to reflect the updated status
                } else {
                    alert('Failed to update order status.');
                }
            })
            .catch(error => {
                console.error('Error updating order status:', error);
                alert('Error updating order status. Please try again later.');
            });
        }
    }
    
    function manageQuote(requestId, quoteNote, counterPrice, timeWindowStart, timeWindowEnd) {
        // Show the Manage Quote modal
        manageQuoteModal.style.display = 'flex';
    
        // Set the Request ID in the modal title
        document.getElementById('request-id-span').textContent = requestId;
    
        // Populate the modal fields with the passed data
        document.getElementById('quote-note-input').value = quoteNote || '';
        document.getElementById('counter-price-input').value = counterPrice || '';
    
        // Convert timeWindowStart and timeWindowEnd to `YYYY-MM-DD` format
        const startDate = timeWindowStart ? new Date(timeWindowStart).toISOString().split('T')[0] : '';
        const endDate = timeWindowEnd ? new Date(timeWindowEnd).toISOString().split('T')[0] : '';
    
        // Populate date inputs
        document.getElementById('time-window-start-input').value = startDate;
        document.getElementById('time-window-end-input').value = endDate;
    
        // Handle form submission as before
        document.getElementById('manage-quote-form').onsubmit = function (e) {
            e.preventDefault();
    
            const updatedQuoteNote = document.getElementById('quote-note-input').value;
            const updatedCounterPrice = document.getElementById('counter-price-input').value;
            const updatedTimeWindowStart = document.getElementById('time-window-start-input').value;
            const updatedTimeWindowEnd = document.getElementById('time-window-end-input').value;
    
            // Submit updated data to the server
            fetch(API_BASE_URL + '/manage_quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                body: JSON.stringify({
                    requestId: requestId,
                    quoteNote: updatedQuoteNote,
                    counterPrice: updatedCounterPrice,
                    timeWindowStart: updatedTimeWindowStart,
                    timeWindowEnd: updatedTimeWindowEnd,
                    status: 'Accepted'
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Quote updated successfully!');
                        closeModal(manageQuoteModal);
                        manageOrders();
                    } else {
                        alert('Failed to update quote.');
                    }
                })
                .catch(error => {
                    console.error('Error submitting quote:', error);
                    alert('Error submitting quote. Please try again later.');
                });
        };
    }
    
    
    
    function viewActiveOrders(orderType) {
        console.log(`Viewing ${orderType === 1 ? 'Active' : 'Completed'} Orders...`);
    
        const userData = JSON.parse(sessionStorage.getItem('user'));
        const userId = userData?.userId;
    
        if (!userId) {
            console.error('User is not authenticated');
            return;
        }
    
        document.getElementById('table').style.display = 'block';
        document.getElementById('formContainer').style.display = 'none';
    
        // Determine the URL based on order type
        const orderStatus = orderType === 1 ? 'In Progress' : 'Completed';
    
        fetch(API_BASE_URL + '/view_orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, orderStatus }),
        })
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('table');
            if (data && data.length > 0) {
                let tableHTML = `<h2>${orderStatus === 'In Progress' ? 'Active' : 'Completed'} Orders</h2>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Request No</th>
                        <th>Service</th>
                        <th>Proposed Price</th>
                        <th>Accepted Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
            `;
                data.forEach(order => {
                    tableHTML += `
                    <tr>
                        <td>${order.order_id || 'N/A'}</td>
                        <td>${order.request_id || 'N/A'}</td>
                        <td>${order.service_name || 'N/A'}</td>
                        <td>${order.proposed_price ? `$${order.proposed_price.toFixed(2)}` : "Not provided"}</td>
                        <td>${order.accepted_date ? new Date(order.accepted_date).toLocaleDateString() : 'N/A'}</td>
                        <td>${order.status || 'N/A'}</td>
                    </tr>
                `;
                });
                tableHTML += `</tbody>`;
                table.innerHTML = tableHTML;
            } else {
                table.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            showAlert('There was an error fetching orders. Please try again later.', 'failure');
        });
    }
    
    
    
    function viewCompletedOrders() {
        console.log("Viewing Completed Work Orders...");
        // Add logic to handle this action
    }
    
    function manageOrderDetails() {
        console.log("Managing Order Details...");
        // Add logic to handle this action
    }
    
    function generateBill() {
        console.log("Generating Bill...");
        // Add logic to handle this action
    }
    
    function viewAllBills() {
        console.log("Viewing All Bills...");
        // Add logic to handle this action
    }
    
    function manageDisputes() {
        console.log("Managing Disputes...");
        // Add logic to handle this action
    }
    
    function viewReports() {
        console.log("Viewing Reports...");
        // Add logic to handle this action
    }
    
    function viewRevenueReport() {
        console.log("Viewing Revenue Report...");
        // Add logic to handle this action
    }
    
    function viewBigClients() {
        console.log("Viewing List of Big Clients...");
        // Add logic to handle this action
    }
    
    function viewOverdueBills() {
        console.log("Viewing Overdue Bills...");
        // Add logic to handle this action
    }
    
    function viewClientRatings() {
        console.log("Viewing Client Ratings...");
        // Add logic to handle this action
    }
    
    
    
    //Clients
    function submitNewRequest() {
        console.log("Submitting a New Request...");
        
        const userData = JSON.parse(sessionStorage.getItem('user')) || {};
        const clientId = userData.userId || '';
        const clientName = `${userData.firstName || ''} ${userData.lastName || ''}`;
        const userType = userData.user_type || '';
        
        const formContainer = document.getElementById('formContainer');
        document.getElementById('formContainer').style.display = 'block';
        document.getElementById('table').style.display = 'none';
        formContainer.innerHTML = `
        <form id="serviceRequestForm">
            <h2>Submit a New Service Request</h2>
            
            <div class="input-container">
                <label for="clientId">Client ID:</label>
                <input type="text" id="clientId" name="clientId" value="${clientId}" readonly required>
            </div>
            
            <div class="input-container">
                <label for="clientName">Client Name:</label>
                <input type="text" id="clientName" name="clientName" value="${clientName}" readonly required>
            </div>
            
            <div class="input-container">
                <label for="serviceType">Service Type:</label>
                <select id="serviceType" name="serviceType" required>
                    <option value="1">Driveway Sealing</option>
                    <option value="2">Crack Repair</option>
                    <option value="3">Pothole Filling</option>
                    <option value="4">Resurfacing</option>
                    <option value="5">Pressure Washing</option>
                    <option value="6">Driveway Cleaning</option>
                    <option value="7">Regraveling</option>
                    <option value="8">Seal Coating</option>
                    <option value="9">Other</option>
                </select>
            </div>
            
            <div class="input-container">
                <label for="description">Property Adress:</label>
                <textarea id="propertyAdress" name="propertyAdress" placeholder="Adress of the property.." required></textarea>
            </div>
    
            <div class="input-container">
                <label for="description">Description of the Issue:</label>
                <textarea id="description" name="description" placeholder="Describe the issue you are facing..." required></textarea>
            </div>
    
            <div class="input-container">
                <label for="urgency">Urgency Level:</label>
                <select id="urgency" name="urgency" required>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            
            <div class="input-container">
                <label for="images">Upload Images (optional):</label>
                <input type="file" id="images" name="images" accept="image/*" multiple>
            </div>
            
            <div class="button-container">
                <button type="submit">Submit Request</button>
            </div>
        </form>
    `;
        
        const serviceRequestForm = document.getElementById('serviceRequestForm');
        serviceRequestForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const serviceType = document.getElementById('serviceType').value;   
            const description = document.getElementById('description').value;
            const urgency = document.getElementById('urgency').value;
            const images = document.getElementById('images').files; // Get multiple files
            
            const formData = new FormData();
            formData.append('clientId', clientId);
            formData.append('clientName', clientName);
            formData.append('userType', userType);
            formData.append('serviceType', serviceType);
            formData.append('propertyAdress', description);
            formData.append('description', description);
            formData.append('urgency', urgency);
            
            // Append each selected file to FormData
            Array.from(images).forEach((image) => {
                formData.append('images', image);  // Same field name ('images') for multiple files
            });
            
            try {
                const response = await fetch(API_BASE_URL + '/submit_request', {
                    method: 'POST',
                    body: formData,
                });
                
                if (!response.ok) throw new Error('Failed to submit request');
                
                const result = await response.json();
                console.log('Request submitted successfully:', result);
                showAlert('Your service request has been submitted successfully!', 'success');
                viewMyRequests()
                
            } catch (error) {
                console.error('Error submitting the request:', error);
                showAlert('An error occurred. Please try again later.', 'failure');
                
            }
        });
    }
    
    function viewMyRequests() {
        console.log("Viewing My Requests...");
        
        // Retrieve user data from sessionStorage
        const userData = JSON.parse(sessionStorage.getItem('user'));
        const userId = userData.userId;  // Get the userId from session data
        
        // Check if userId is present
        if (!userId) {
            console.error('User is not authenticated');
            return;  // Exit the function if no userId found
        }
        
        // Fetch the user's service requests from the server using a POST request
        fetch(API_BASE_URL + '/view_requests', {
            method: 'POST',  // Use POST method to send data
            headers: {
                'Content-Type': 'application/json',  // Ensure the server knows we're sending JSON
            },
            body: JSON.stringify({ userId: userId })  // Send userId in the request body
        })
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('table'); // Get the table by id
            document.getElementById('formContainer').style.display = 'none';
            document.getElementById('table').style.display = 'block';
            
            // Check if there are any requests to display
            if (data && data.length > 0) {
                // Create table headers based on the fields
                let tableHTML = `<h2>My Service Requests</h2>
                <thead>
                    <tr>
                        <th>Request No</th>
                        <th>Service</th>
                        <th>Property Address</th>
                        <th>Proposed Price</th>
                        <th>Note</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Images</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
            `;
                
                // Loop through the data to populate rows
                data.forEach(request => {
                    tableHTML += `
                    <tr>
                        <td>${request.request_id}</td>
                        <td>${request.service_name}</td>
                        <td>${request.property_address}</td>
                        <td>${request.proposed_price ? `$${request.proposed_price.toFixed(2)}` : "Not provided"}</td>
                        <td>${request.note ? request.note : 'N/A'}</td>
                        <td>${request.urgency ? request.urgency : 'N/A'}</td>
                        <td>${request.status ? request.status : 'N/A'}</td>
                        <td>${new Date(request.created_at).toLocaleString()}</td>
                        <td>${request.image_urls ? request.image_urls.split(', ').map(url => `<a href="${url}" target="_blank"><img src="${url}" alt="Request Image" style="width: 100px; height: 100px; display: inline; margin-right: 10px;" /></a>`).join('') : 'No Images'}</td>
                        <td><button class="delete-row-btn" data-id=${request.request_id}>Delete</button></td>
                    </tr>
                `;
                });
                
                // Close the table tags
                tableHTML += `
                </tbody>
            `;
                
                // Inject the table rows into the table element with id "table"
                table.innerHTML = tableHTML;
                
                // Add event listener for Delete buttons
                // Add event listener for Delete buttons
                document.querySelectorAll('.delete-row-btn').forEach(button => {
                    button.addEventListener('click', event => {
                        const request_id = event.target.getAttribute('data-id');
                        
                        // Show confirmation message using window.confirm
                        const isConfirmed = window.confirm(`Are you sure you want to delete the service request: ${request_id}?`);
                        
                        // Show alert based on the confirmation result
                        if (isConfirmed) {
                            deleteRowById(request_id); 
                            showAlert(`Client ID: ${request_id} has been successfully deleted.`, 'success');
                        } else {
                            showAlert('Delete action cancelled.', 'failure');
                        }
                    });
                });
                
                
                
            } else {
                table.innerHTML = '<tr>No service requests found.</tr>';
            }
        })
        .catch(error => {
            console.error('Error in fetching requests:', error);
            showAlert('There was an error fetching your requests. Please try again later.', 'failure');
        });
    }
    
    
    function viewMyOrders() {
        console.log("Viewing My Orders...");
        
        const userData = JSON.parse(sessionStorage.getItem('user'));
        const userId = userData?.userId;
        
        if (!userId) {
            console.error('User is not authenticated');
            return;
        }
        
        document.getElementById('table').style.display = 'block';
        document.getElementById('formContainer').style.display = 'none';
        
        fetch(API_BASE_URL + '/view_orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        })
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('table');
            if (data && data.length > 0) {
                let tableHTML = `<h2>My Orders</h2>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Request No</th>
                        <th>Service</th>
                        <th>Proposed Price</th>
                        <th>Accepted Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
            `;
                data.forEach(order => {
                    tableHTML += `
                    <tr>
                        <td>${order.order_id || 'N/A'}</td>
                        <td>${order.request_id || 'N/A'}</td>
                        <td>${order.service_name || 'N/A'}</td>
                        <td>${order.proposed_price ? `$${order.proposed_price.toFixed(2)}` : "Not provided"}</td>
                        <td>${order.accepted_date ? new Date(order.accepted_date).toLocaleDateString() : 'N/A'}</td>
                        <td>${order.status || 'N/A'}</td>
                    </tr>
                `;
                });
                tableHTML += `</tbody>`;
                table.innerHTML = tableHTML;
            }else {
                table.innerHTML = '<tr>No service requests found.</tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            showAlert('There was an error fetching your orders. Please try again later.', 'failure');
        });
    }
    
    
    
    function manageNegotiations() {
        console.log("Managing Order Negotiations...");
        
        // Retrieve user data from sessionStorage
        const userData = JSON.parse(sessionStorage.getItem('user'));
        const userId = userData ? userData.userId : null;
        
        if (!userId) {
            console.error('User is not authenticated');
            return;
        }
        
        // Dynamically add the header for managing negotiations
        document.getElementById('table').style.display = 'block';
        document.getElementById('formContainer').style.display = 'none';
        
        // Fetch negotiation-related orders
        fetch(API_BASE_URL + '/manage_negotiations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }),
        })
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('table');
            
            if (data && data.length > 0) {
                let tableHTML = `<h2>Manage Negotiations</h2>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Proposed Price</th>
                        <th>Counter Price</th>
                        <th>Time Window</th>
                        <th>Response Note</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
            `;
                
                // Dynamically populate rows
                data.forEach(order => {
                    tableHTML += `
                    <tr>
                        <td>${order.order_id}</td>
                        <td>${order.proposed_price ? `$${order.proposed_price.toFixed(2)}` : "Not provided"}</td>
                        <td>${order.counter_price ? `$${order.counter_price.toFixed(2)}` : "Not provided"}</td>
                        <td>${order.time_window_start && order.time_window_end 
                    ? `${order.time_window_start} to ${order.time_window_end}` 
                    : "Not specified"}</td>
                        <td>${order.response_note || "No notes provided"}</td>
                        <td>${order.status}</td>
                        <td>
                            <button onclick="handleNegotiation(${order.response_id}, 'Accept')">Accept</button>
                            <button onclick="handleNegotiation(${order.response_id}, 'Decline')">Decline</button>
                        </td>
                    </tr>
                `;
                });
                
                tableHTML += `</tbody>`;
                table.innerHTML = tableHTML;
            } else {
                table.innerHTML = '<tr><td colspan="6">No negotiations to manage.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error managing negotiations:', error);
            showAlert('There was an error fetching negotiation data. Please try again later.', 'failure');
        });
    }
    
    function handleNegotiation(responseId, action) {
        const status = action === 'Accept' ? 'Accepted' : 'Rejected';
        
        // Make the request to update the negotiation status
        fetch(API_BASE_URL + '/update_negotiation_status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ responseId: responseId, status: status })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`${action} negotiation successfully!`);
                manageNegotiations();  // Refresh negotiations table after action
            } else {
                alert(`Failed to ${action.toLowerCase()} the negotiation.`);
            }
        })
        .catch(error => {
            console.error(`Error ${action.toLowerCase()}ing negotiation:`, error);
            alert(`Error during negotiation ${action.toLowerCase()}.`);
        });
    }
    
    
    function viewBills() {
        console.log("Viewing Bills...");
        // Add logic to handle this action
    }
    
    function payBill() {
        console.log("Paying Bill...");
        // Add logic to handle this action
    }
    
    function disputeBill() {
        console.log("Disputing Bill...");
        // Add logic to handle this action
    }
    
    
    function viewProfile() {
        console.log("Viewing Profile...");
        
        // Retrieve user data from sessionStorage
        const userData = JSON.parse(sessionStorage.getItem('user'));
        const userId = userData.userId;  // Get the userId from session data
        
        // Check if userId is present
        if (!userId) {
            console.error('User is not authenticated');
            return;
        }
        
        // Fetch the user's profile data from the server
        fetch(API_BASE_URL + '/view_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId })  // Send userId in the request body
        })
        .then(response => response.json())
        .then(data => {
            const formContainer = document.getElementById('formContainer');
            document.getElementById('formContainer').style.display = 'block';
            document.getElementById('table').style.display = 'none';
            
            
            if (data) {
                formContainer.innerHTML = `
                <form id="profileForm">
                <h2>Edit User Profile</h2>
                    <div class="input-container">
                        <label for="firstName">First Name:</label>
                        <input type="text" id="firstName" name="firstName" value="${data.first_name}" required />
                    </div>
                    <div class="input-container">
                        <label for="lastName">Last Name:</label>
                        <input type="text" id="lastName" name="lastName" value="${data.last_name}" required />
                    </div>
                    <div class="input-container">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" value="${data.email}" required />
                    </div>
                    <div class="input-container">
                        <label for="phone">Phone:</label>
                        <input type="text" id="phone" name="phone" value="${data.phone}" required />
                    </div>
                    <div class="input-container">
                        <label for="address">Address:</label>
                        <textarea id="address" name="address" required>${data.address}</textarea>
                    </div>
                    <div class="input-container">
                        <label for="creditCard">Credit Card:</label>
                        <input type="text" id="creditCard" name="creditCard" value="${data.credit_card}" required />
                    </div>
                    <div class="button-container">
                        <button type="submit">Save Changes</button>
                    </div>
                </form>
            `;
                
                // Add an event listener to handle the form submission
                document.getElementById('profileForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Collect the updated data from the form
                    const updatedData = {
                        userId: userId,
                        first_name: document.getElementById('firstName').value,
                        last_name: document.getElementById('lastName').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        address: document.getElementById('address').value,
                        credit_card: document.getElementById('creditCard').value,
                    };
                    
                    // Send the updated data to the server
                    fetch(API_BASE_URL + '/update_profile', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showAlert('Profile updated successfully!', 'success');
                        } else {
                            showAlert('Failed to update profile. Please try again later.', 'failure');
                        }
                    })
                    .catch(error => {
                        console.error('Error updating profile:', error);
                        showAlert('There was an error updating your profile. Please try again later.', 'failure');
                    });
                });
            } else {
                formContainer.innerHTML = '<p>No profile data found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            showAlert('There was an error fetching your profile. Please try again later.', 'failure');
        });
    }
    
    function viewPaymentHistory() {
        console.log("Viewing Payment History...");
        
        // Retrieve user data from sessionStorage
        const userData = JSON.parse(sessionStorage.getItem('user'));
        const userId = userData.userId;  // Get the userId from session data
        
        // Check if userId is present
        if (!userId) {
            console.error('User is not authenticated');
            return;
        }
        
        // Fetch the user's payment history from the server
        fetch(API_BASE_URL + '/view_payment_history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId })  // Send userId in the request body
        })
        .then(response => response.json())
        .then(data => {
            const paymentHistoryContainer = document.getElementById('paymentHistoryContainer');
            
            if (data && data.length > 0) {
                let tableHTML = `
                <thead>
                    <tr>
                        <th>Payment ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Paid On</th>
                    </tr>
                </thead>
                <tbody>
            `;
                
                data.forEach(payment => {
                    tableHTML += `
                    <tr>
                        <td>${payment.payment_id}</td>
                        <td>${payment.amount}</td>
                        <td>${payment.status}</td>
                        <td>${new Date(payment.paid_on).toLocaleString()}</td>
                    </tr>
                `;
                });
                
                tableHTML += `</tbody>`;
                paymentHistoryContainer.innerHTML = tableHTML;
            } else {
                paymentHistoryContainer.innerHTML = '<p>No payment history found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching payment history:', error);
            showAlert('There was an error fetching your payment history. Please try again later.', 'failure');
        });
    }
    
    
    
    // Call the renderMenu function on page load
    window.onload = renderMenu;
    
    
    
    
    document.getElementById("contractor-btn").addEventListener("click", function() {
        // Record the selected user type as '2' for Contractor
        document.getElementById("user-type").value = "2";
        
        // Hide the user type selection and show the rest of the form
        document.getElementById("user-type-selection").style.display = "none";
        document.getElementById("sign-up-form").style.display = "block";
    });
    
    document.getElementById("client-btn").addEventListener("click", function() {
        // Record the selected user type as '3' for Client
        const userType = document.getElementById("user-type").value = "3";
        
        // Hide the user type selection and show the rest of the form
        document.getElementById("user-type-selection").style.display = "none";
        document.getElementById("sign-up-form").style.display = "block";
    });
    
    // Back to User Type Selection
    document.getElementById("back-btn").addEventListener("click", function() {
        // Show the user type selection again and hide the sign-up form
        document.getElementById("user-type-selection").style.display = "block";
        document.getElementById("sign-up-form").style.display = "none";
    });
    
    
    
    // Sign-up action
    document.getElementById('sign-up-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission
        
        // Collect data from form fields
        const userType = document.getElementById('user-type').value;
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const address = document.getElementById('address').value;
        
        // Add validation
        if (!firstName || !lastName || !email || !password || !phone || !address) {
            showAlert('Please fill in all required fields.', 'failure');
            return;
        }
        
        // Email format validation
        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        if (!email.match(emailPattern)) {
            showAlert('Please enter a valid email address.', 'failure');
            return;
        }
        
        // Password validation
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
        if (!password.match(passwordPattern)) {
            showAlert('Password must be between 8 and 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters.', 'failure');
            return;
        }
        
        // Create a user object without hashing the password client-side
        const userData = {
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password, // Send plaintext password to the server
            phone: phone,
            address: address
        };
        
        // Send user data to backend
        try {
            const response = await fetch(API_BASE_URL + '/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('Sign up successful!', 'success'); 
                document.getElementById('sign-up-modal').style.display = 'none';
            } else {
                showAlert('Sign up failed: ' + result.error, 'failure');
            }
        } catch (error) {
            console.error('Error during sign up:', error);
        }
    });
    
    // Sign-in action
    document.getElementById('sign-in-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission
        
        // Collect data from form fields
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        
        // Add validation
        if (!email || !password) {
            showAlert('Please fill in all required fields.', 'failure');
            return;
        }
        
        // Send login request to backend
        try {
            const response = await fetch(API_BASE_URL + '/signin', {
                method: 'POST',
                credentials: 'include', // If you are using cookies for session management
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }) // Send plaintext password
            });
            
            const result = await response.json();
            // alert(JSON.stringify(result))
            
            if (response.ok) {
                // Store JWT in localStorage or sessionStorage
                localStorage.setItem('authToken', result.token); // Store JWT token
                
                // Update UI elements based on sign-in status
                document.getElementById('sign-in-modal').style.display = 'none';
                document.getElementById('sign-up-btn').style.display = 'none';
                document.getElementById('sign-in-btn').style.display = 'none';
                document.getElementById('sign-out-btn').style.display = 'block';
                
                // Optionally, reload the page or redirect
                toggleSignInStatus(true);  // Update the UI sign-in state
                localStorage.setItem('reloadFlag', 'true');
                location.reload();
            } else {
                showAlert('Sign in failed: ' + result.error, 'failure');
            }
        } catch (error) {
            console.error('Error during sign in:', error);
            showAlert("An error occurred during sign in. Please try again.", "failure");
        }
    });
    
    // Check if the flag is set on page load
    window.addEventListener('load', () => {
        const reloadFlag = localStorage.getItem('reloadFlag');
        
        if (reloadFlag === 'true') {
            // Reset the flag
            localStorage.removeItem('reloadFlag');
            
            // Trigger the second reload after a short delay
            setTimeout(() => {
                location.reload();
            }, 100); // 100ms delay before the second reload
            
            setTimeout(() => {
                location.reload();
            }, 100);
        }
    });
    
    
    
    //sign-out action
    document.getElementById('sign-out-btn').addEventListener('click', async () => {
        try {
            // Get the JWT token from localStorage
            const authToken = localStorage.getItem('authToken');
            
            if (!authToken) {
                console.error('No token found');
                showAlert('You are not logged in.', 'failure');
                return;
            }
            
            // Send request to logout route with the token in the Authorization header
            const response = await fetch(API_BASE_URL + '/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Add token to Authorization header
                },
                credentials: 'include', // Ensure session cookies are included if used
            });
            
            // Check if the logout was successful
            if (response.ok) {
                // Clear the JWT token from localStorage
                localStorage.removeItem('authToken');
                toggleSignInStatus(false);  // Update the UI sign-in state
                showAlert('Successfully logged out.', 'success');  // Inform user of success
                location.reload();
            } else {
                // Handle error during logout
                const errorData = await response.json();
                console.error('Logout error:', errorData);
                showAlert('Logout failed. Please try again.', 'failure');
            }
        } catch (error) {
            // Catch any network or other errors
            console.error('Error during logout:', error);
            showAlert("An error occurred during logout. Please try again.", "failure");
        }
    });
    
    
    
    //not exactly deleting
    function deleteRowById(request_id) {
        console.log("Attempting to delete row with Request ID:", request_id);
        
        fetch(API_BASE_URL + '/delete/' + request_id, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken') // Ensure you are passing the correct token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Row marked as deleted successfully");
                location.reload(); // Or update the UI dynamically
            } else {
                console.log("Error deleting row:", data.message || "Unknown error");
            }
        })
        .catch(error => {
            console.error("Error during the fetch operation:", error);
        });
    }
    
    
    
    
    
    
    function displayResults(results) {
        if(results){
            loadHTMLTable(results);
        }
    }
    
    // this function is used for debugging only, and should be deleted afterwards
    function debug(data)
    {
        fetch(API_BASE_URL + '/debug', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({debug: data})
        })
    }
    
    // Get modal elements
    const signUpModal = document.getElementById('sign-up-modal');
    const signInModal = document.getElementById('sign-in-modal');
    const closeSignUp = document.getElementById('close-sign-up');
    const closeSignIn = document.getElementById('close-sign-in');
    const signUpBtn = document.getElementById('sign-up-btn');
    const signInBtn = document.getElementById('sign-in-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const updateModal = document.getElementById('update-row-modal');
    const closeUpdateRow = document.getElementById('close-update-row');
    const manageQuoteModal = document.getElementById('manage-quote-modal');
    const closeManageQuote = document.getElementById('close-manage-quote');
    
    // Elements for sign-in status
    const signedInSection = document.getElementById('signed-in-section');
    const guestSection = document.getElementById('guest-section');
    
    // Function to close modals
    const closeModal = (modal) => {
        modal.style.display = "none";
    };
    
    // Event listeners for modal buttons
    closeUpdateRow.addEventListener('click', () => closeModal(updateModal));
    signUpBtn.addEventListener('click', () => signUpModal.style.display = "flex");
    signInBtn.addEventListener('click', () => signInModal.style.display = "flex");
    closeSignUp.addEventListener('click', () => closeModal(signUpModal));
    closeSignIn.addEventListener('click', () => closeModal(signInModal));
    closeManageQuote.addEventListener('click', () => closeModal(manageQuoteModal));
    
    
    // Close modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === signUpModal) closeModal(signUpModal);
        if (event.target === signInModal) closeModal(signInModal);
        if (event.target === updateModal) closeModal(updateModal);
        if (event.target === manageQuoteModal) closeModal(manageQuoteModal);
    });
    
    // Function to toggle sign-in status
    const toggleSignInStatus = (isLoggedIn) => {
        
        const welcomeMessage = document.getElementById('welcome-message');
        signInBtn.style.display = isLoggedIn ? 'none' : 'inline';
        signUpBtn.style.display = isLoggedIn ? 'none' : 'inline';
        signOutBtn.style.display = isLoggedIn ? 'inline' : 'none';
        signedInSection.classList.toggle('disabled', !isLoggedIn);
        guestSection.style.display = isLoggedIn ? 'none' : 'block';
        welcomeMessage.hidden = !isLoggedIn;
        
    };
    
    
    
    