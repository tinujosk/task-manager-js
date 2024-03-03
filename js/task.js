let editMode = false;
let editTaskId = null;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Render tasks on page load
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  M.Datepicker.init($('.datepicker'), {
    format: 'yyyy-mm-dd',
    autoClose: true,
  });
  M.FormSelect.init($('select'), {});
});

// Function to get color class based on priority
const getColorClass = priority => {
  switch (priority) {
    case 'Low':
      return 'green darken-1';
    case 'Medium':
      return 'orange darken-1';
    case 'High':
      return 'red darken-1';
    default:
      return 'blue-grey darken-1';
  }
};

// Function to create a card for each task
const createTaskCard = task => {
  const card = document.createElement('div');
  card.innerHTML = `
  <div class="col">
  <div class="card ${getColorClass(task.priority)} white-text">
  <div class="card-title">
  ${task.taskName}
  <i class="material-icons delete-icon" data-task-id="${task.id}">delete</i>
  <i class="material-icons edit-icon" data-task-id="${task.id}">edit</i>
  </div>
  <div class="card-content">
        <p><strong>Assignee:</strong> ${task.assignee}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Due Date:</strong> ${task.dueDate}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
  </div>
  </div>
  </div>
    `;

  const deleteIcon = card.querySelector('.delete-icon');
  const editIcon = card.querySelector('.edit-icon');

  editIcon.addEventListener('click', function () {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    const taskId = this.getAttribute('data-task-id');
    const task = tasks.find(task => task.id === parseInt(taskId));
    if (task) {
      editMode = true;
      editTaskId = task.id;
      changeEditStyles(editMode);
      $('#task-name').val(task.taskName);
      $('#assignee').val(task.assignee);
      $('#description').val(task.description);
      $('#due-date').val(task.dueDate);
      M.FormSelect.getInstance($('#priority')).input.value = task.priority;
      $('.input-field label:not(:last)').addClass('active');
    }
  });

  deleteIcon.addEventListener('click', function () {
    $('.modal').modal();
    $('#modal-prompt').modal('open');
    $('#confirm-delete').click(() => {
      const taskId = this.getAttribute('data-task-id');
      let tasks = JSON.parse(localStorage.getItem('tasks'));
      tasks = tasks.filter(task => task.id !== parseInt(taskId));
      console.log('tasks', tasks);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      $('#modal-prompt').modal('close');
      renderTasks();
      M.toast({
        html: 'Task deleted!',
        classes: 'red',
        displayBottom: true,
      });
    });
  });

  return card;
};

// Function to render all tasks
renderTasks = () => {
  $('#task-list').text('');
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  console.log('check legth', tasks);
  if (!tasks || !tasks.length) {
    $('#task-list').html(`<div class="no-task"><p>No tasks found.<br>
    Please start adding your tasks</p>
    <i class="material-icons no-task-icon">checklist</i>
    <div>`);
  } else {
    tasks.reverse();
    tasks.forEach((task, index) => {
      const card = createTaskCard(task);
      $('#task-list').append(card);
      if (index === 0) {
        card.classList.add('fade-in');
      }
    });
  }
  $('.scroll-more').css({
    display: tasks && tasks.length >= 4 ? 'block' : 'none',
  });
};

const addTask = taskValues => {
  const { taskName, assignee, dueDate, description, priority } = taskValues;
  // Get tasks from localStorage
  let tasks = localStorage.getItem('tasks');
  tasks = tasks ? JSON.parse(tasks) : [];
  const lastTaskId = tasks[tasks.length - 1]?.id || 0;

  // Create task object
  const task = {
    id: lastTaskId + 1,
    taskName,
    assignee,
    description,
    dueDate,
    priority,
  };

  // Add new task
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  M.toast({
    html: 'Task added successfully!',
    classes: 'green',
    displayBottom: true,
  }); // Show toast message

  $('#task-form')[0].reset();
  renderTasks();
};

const changeEditStyles = editMode => {
  if (editMode) {
    $('#addEditBtn').text('Save Edit');
    $('#cancelEdit').show();
    $('#task-form').css({ border: '1px solid red' });
    $('.editModeLabel').show();
  } else {
    $('#addEditBtn').text('Add Task');
    $('#cancelEdit').hide();
    $('#task-form').css({ border: 'none' });
    $('.editModeLabel').hide();
  }
};

const editTask = (taskValues, editTaskId) => {
  let tasks = localStorage.getItem('tasks');
  tasks = tasks ? JSON.parse(tasks) : [];

  const updatedTasks = tasks.map(task => {
    if (task.id === editTaskId) {
      return { id: editTaskId, ...taskValues };
    }
    return task;
  });
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  M.toast({
    html: 'Task Edited successfully!',
    classes: 'green',
    displayBottom: true,
  }); // Show toast message

  $('#task-form')[0].reset();
  editMode = false;
  changeEditStyles(editMode);
  renderTasks();
};

$('#cancelEdit').click(e => {
  e.preventDefault();
  editMode = false;
  changeEditStyles(editMode);
  $('#task-form')[0].reset();
});

$('#task-form').submit(e => {
  e.preventDefault();

  // Get form values
  const taskName = $('#task-name').val();
  const assignee = $('#assignee').val();
  const description = $('#description').val();
  const dueDate = $('#due-date').val();
  const priority = M.FormSelect.getInstance($('#priority')).input.value;

  if (
    taskName !== '' &&
    assignee !== '' &&
    dueDate !== '' &&
    dateRegex.test(dueDate) &&
    description !== '' &&
    priority !== 'Choose Priority'
  ) {
    const taskData = { taskName, assignee, description, dueDate, priority };
    if (editMode) {
      editTask(taskData, editTaskId);
    } else {
      addTask(taskData);
    }
  } else {
    M.toast({
      html: 'Please add all mandatory fields! Also ensure date format',
      classes: 'red',
      displayBottom: true,
    }); // Show toast message
  }
});
