const form = document.getElementById('numberForm');

document.addEventListener("DOMContentLoaded", function () {
  const phoneForm = document.getElementById("phoneForm");
  if (phoneForm) {
      phoneForm.addEventListener("submit", function (event) {
          event.preventDefault();
          const phoneNumber = document.getElementById("phoneNumber").value;
          const errorMessage = document.getElementById("errorMessage");

          if (/^\d{11}$/.test(phoneNumber)) {
              fetch('/submit-phone', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ phoneNumber })
              })
              .then(response => {
                  if (response.ok) {
                      window.location.href = '/thanks.html';
                  } else {
                      errorMessage.textContent = 'Failed to save phone number. Try again.';
                  }
              });
          } else {
              errorMessage.textContent = 'Please enter a valid 11-digit phone number.';
              console.log(document.getElementById("phoneForm"));
          }
      });
  } else {
      console.error('Element with id "phoneForm" not found!');
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