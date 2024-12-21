const form = document.getElementById('numberForm');

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const number = document.getElementById('phoneNumber').value;

    if (!/^\d{11}$/.test(number)) {
        document.getElementById('error').innerText = 'Number must be exactly 11 digits.';
        return;
    }

    try {
        const res = await fetch('/check-number', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number }),
        });

        const data = await res.json();

        if (data.success) {
            window.location.href = `/success.html?number=${number}&discount=${data.discount}`;
        } else {
            document.getElementById('error').innerText = data.message;
        }
    } catch (error) {
        document.getElementById('error').innerText = 'An error occurred. Please try again later.';
    }
});

async function searchUser() {
    const searchNumber = document.getElementById('searchNumber').value;

    if (!/^\d{11}$/.test(searchNumber)) {
        alert('Please enter a valid 11-digit number.');
        return;
    }

    try {
        const res = await fetch(`/admin/search?number=${searchNumber}`);

        if (!res.ok) {
            alert('User not found.');
            return;
        }

        const user = await res.json();
        const table = document.getElementById('userTable');
        table.innerHTML = '<tr><th>Number</th><th>5% Taken</th><th>10% Taken</th><th>Actions</th></tr>';

        table.innerHTML += `<tr>
            <td>${user.number}</td>
            <td>${user.taken5 ? 'Yes' : 'No'}</td>
            <td>${user.taken10 ? 'Yes' : 'No'}</td>
            <td>
                ${!user.taken5 ? `<button onclick="markTaken('${user.number}', 5)">Mark 5%</button>` : ''}
                ${user.taken5 && !user.taken10 ? `<button onclick="markTaken('${user.number}', 10)">Mark 10%</button>` : ''}
            </td>
        </tr>`;
    } catch (error) {
        alert('An error occurred while fetching user details.');
    }
}

async function markTaken(number, discount) {
    try {
        const res = await fetch('/admin/mark-claimed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, discount }),
        });

        const data = await res.json();

        if (data.success) {
            alert(data.message);
            searchUser();
        } else {
            alert(data.message || 'An error occurred.');
        }
    } catch (error) {
        alert('An error occurred while updating the discount.');
    }
}