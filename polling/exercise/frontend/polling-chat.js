const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = { user, text }

  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json'}
  };

  await fetch('/poll', options);

  // const json = await res.json(); // will return { status: 'ok' }
}



async function getNewMsgs() {
  let json;

  try {
    const res = await fetch("/poll");
    json = await res.json();

    if (res.status >= 400)  {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    allChat = json.msg;
    render();
    failedTries = 0;

  } catch (e) {
    console.error("Polling error:", e);
    failedTries++;
  }


}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

let timeToMakeNextReq = 0;
let failedTries = 0;

const BACKOFF = 5000;

// raf - requestAnimationFrame
async function rafTimer(time) {
  if (timeToMakeNextReq <= time)  {
    await getNewMsgs();

    timeToMakeNextReq = time + INTERVAL + failedTries & BACKOFF;
  }

  requestAnimationFrame(rafTimer);
};

requestAnimationFrame(rafTimer);
// this is a polling loop that will run every INTERVAL milliseconds
