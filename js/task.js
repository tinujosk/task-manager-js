// Initialize datepicker
document.addEventListener('DOMContentLoaded', function () {
  var datepickers = document.querySelectorAll('.datepicker');
  var instances = M.Datepicker.init(datepickers, {
    format: 'yyyy-mm-dd',
    autoClose: true,
  });
});

// Initialize select
document.addEventListener('DOMContentLoaded', function () {
  var selects = document.querySelectorAll('select');
  var instances = M.FormSelect.init(selects, {});
});

// Sample tasks data for testing
const tasks = [
  {
    taskName: 'Task 1',
    assignee: 'User 1',
    description: 'Description 1',
    dueDate: '2024-03-01',
    priority: 'high',
  },
  {
    taskName: 'Task 2',
    assignee: 'User 2',
    description: 'Description 2',
    dueDate: '2024-03-02',
    priority: 'medium',
  },
  {
    taskName: 'Task 3',
    assignee: 'User 3',
    description: 'Description 3',
    dueDate: '2024-03-03',
    priority: 'low',
  },
];

const taskList = document.getElementById('task-list');

// Function to create a card for each task
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'col';

  const cardContent = document.createElement('div');
  cardContent.className = 'card blue-grey darken-1 white-text';
  card.appendChild(cardContent);

  const cardTitle = document.createElement('div');
  cardTitle.className = 'card-content';
  cardTitle.textContent = task.taskName;
  cardContent.appendChild(cardTitle);

  const cardDetails = document.createElement('div');
  cardDetails.className = 'card-content';
  cardDetails.innerHTML = `
        <p><strong>Assignee:</strong> ${task.assignee}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Due Date:</strong> ${task.dueDate}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
    `;
  cardContent.appendChild(cardDetails);

  return card;
}

// Function to render all tasks
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const card = createTaskCard(task);
    taskList.appendChild(card);
  });
}

// Render tasks on page load
document.addEventListener('DOMContentLoaded', function () {
  renderTasks();
});
