document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch emails user has in that mailbox
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    // Loop through emails
    emails.forEach(email => {
      console.log(email)

      // Put emails in a div
      const newDiv = document.createElement('div');
      
      // Check email status
      if (email.read) {
        newDiv.className = 'read';
      } else {
        newDiv.className = 'unread';
      }

      newDiv.style.border = '1px solid black';
      //CS50ai generated code to add sender,subject,timestamp
      newDiv.innerText = `From: ${email.sender}\nTo: ${email.recipients}\nSubject: ${email.subject}\nTimestamp: ${email.timestamp}\nRead: ${email.read}`;
      document.querySelector('#emails-view').appendChild(newDiv);

      console.log(email);

      // Click event for email view
      newDiv.addEventListener('click', function() {
        view_email(email.id)
      });
    })
  })
}

function view_email(id) {
  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {

    console.log(email);

    // Hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    // Update read status for email
    if (!email.read) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }

    // Display content
    // Email will be unread when opening the email for the first time, but will be marked read once opened and navigate away
    let view_email = document.querySelector('#email-view');
    view_email.innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><b>From:</b> ${email.sender}</li>
        <li class="list-group-item"><b>To:</b> ${email.recipients}</li>
        <li class="list-group-item"><b>Subject:</b> ${email.subject}</li>
        <li class="list-group-item"><b>Timestamp:</b> ${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
        <li class="list-group-item"><muted>Read:</muted>${email.read}</li>
      </ul>
      `;
      view_email.style.display = 'block';


  // Archive button
    const archiveButton = document.createElement('button');
    // Check if email is not archived
    if (!email.archived) {
      archiveButton.textContent = 'Archive';
      archiveButton.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      // Load inbox
      .then(() => {load_mailbox('inbox')});
    })
    // Handle case if email is archived
    } else {
      archiveButton.textContent = 'Unarchive';
      archiveButton.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
      .then(() => {load_mailbox('inbox')})
      })
    }
    // append the button
    view_email.appendChild(archiveButton)

  // Reply button
    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.addEventListener('click', function() {
      compose_email();

      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email.subject;
      if(subject.split(' ', 1)[0] != "Re:") {
        subject = "Re: " + email.subject;
      }
      document.querySelector('#compose-subject').value = subject;
      // Add the required text
      let body = `
        On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      
        document.querySelector('#compose-body').value = body;
    })
    // Append Reply button
    view_email.appendChild(replyButton)
})
}

// From homework page
function send_email(event) {
  console.log("send_email function called");
  event.preventDefault()

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
  }
  return response.json();
})
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}