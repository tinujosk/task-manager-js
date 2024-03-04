let editMode = false;
let editTaskId = null;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
let tasksInStorage = [];

// Intialise few components, read from local storage and do initial render on document load.
document.addEventListener('DOMContentLoaded', () => {
  tasksInStorage = JSON.parse(localStorage.getItem('tasks')) || [];
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
  // The card is created dymically
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

  // Adding event listener for edit click
  editIcon.addEventListener('click', function () {
    const taskId = this.getAttribute('data-task-id');
    // Find the task which is clicked and fill those details in the form for editing
    const task = tasksInStorage.find(task => task.id === parseInt(taskId));
    if (task) {
      // Switch to edit mode and store the edit task id, and change the edit styles.
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

  // Adding event listener for delete click
  deleteIcon.addEventListener('click', function () {
    // Open a confirmation modal for delete
    $('.modal').modal();
    $('#modal-prompt').modal('open');
    $('#confirm-delete').click(function () {
      // Filter out remaining task to delete the clicked task, and update global task array and localStorage
      const taskId = deleteIcon.getAttribute('data-task-id');
      tasksInStorage = tasksInStorage.filter(
        task => task.id !== parseInt(taskId)
      );
      localStorage.setItem('tasks', JSON.stringify(tasksInStorage));
      $('#modal-prompt').modal('close');
      // Re render tasks
      renderTasks();
      // Show a toast
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
renderTasks = (addMode, filteredTasks) => {
  $('#task-list').text('');
  // If there is filteredTasks (incase of search), show that, else show the tasks from the localStorage
  const tasks = filteredTasks || tasksInStorage;
  if (!tasks.length) {
    let notFoundText;
    // Check which message to display, if it's a search mode and no task found, show that message, else
    // show the other message when no task is available at all.
    if ($('#search').val() !== '') {
      notFoundText = `<div class="no-task"><p>Search not found.<br>
      Refine your search</p>
      <i class="material-icons no-task-icon">manage_search</i>
      <div>`;
    } else {
      notFoundText = `<div class="no-task"><p>No tasks found.<br>
      Please start adding your tasks</p>
      <i class="material-icons no-task-icon">checklist</i>
      <div>`;
    }
    $('#task-list').html(notFoundText);
  } else {
    // If there are tasks, then create task cards.
    tasks.forEach((task, index) => {
      const card = createTaskCard(task);
      $('#task-list').append(card);
      if (addMode && index === 0) {
        card.classList.add('fade-in');
      }
    });
  }
  // Show a "scroll to see more text" at the bottom when there are 4 or more cards.
  $('.scroll-more').css({
    display: tasks && tasks.length >= 4 ? 'block' : 'none',
  });
};

// Function to add new tasks.
const addTask = taskValues => {
  const { taskName, assignee, dueDate, description, priority } = taskValues;
  // const lastTaskId = tasksInStorage[tasksInStorage.length - 1]?.id || 0;
  const id = tasksInStorage.length === 0 ? 1 : tasksInStorage[0]?.id + 1;

  // Create task object, we also generate a unique ID, on adding each task based on last item id.
  const task = {
    id,
    taskName,
    assignee,
    description,
    dueDate,
    priority,
  };

  // Add new task to the beginning of the array in order to display it on top, and update localStorage
  tasksInStorage.unshift(task);
  localStorage.setItem('tasks', JSON.stringify(tasksInStorage));

  // Show toast
  M.toast({
    html: 'Task added successfully!',
    classes: 'green',
  });

  // Reset the form and render the new data.
  $('#task-form')[0].reset();
  renderTasks(true);
};

// Change the edit mode styles based on editMode flag
const changeEditStyles = editMode => {
  if (editMode) {
    $('#add-edit-btn').text('Save Edit');
    $('#cancel-edit').show();
    $('#task-form').css({ border: '1px solid red' });
    $('.editmode-label').show();
  } else {
    $('#add-edit-btn').text('Add Task');
    $('#cancel-edit').hide();
    $('#task-form').css({ border: 'none' });
    $('.editmode-label').hide();
  }
};

// Function to edit a task
const editTask = (taskValues, editTaskId) => {
  // Find the task, apply new values, and store it in localStorage.
  tasksInStorage = tasksInStorage.map(task => {
    if (task.id === editTaskId) {
      return { id: editTaskId, ...taskValues };
    }
    return task;
  });
  localStorage.setItem('tasks', JSON.stringify(tasksInStorage));

  // Show toast.
  M.toast({
    html: 'Task Edited successfully!',
    classes: 'green',
  });

  // Reset form, disable editMode and its styles, and re-render.
  $('#task-form')[0].reset();
  editMode = false;
  changeEditStyles(editMode);
  renderTasks();
};

// Cancel the edit mode on Cancel Edit click
$('#cancel-edit').click(e => {
  e.preventDefault();
  editMode = false;
  changeEditStyles(editMode);
  $('#task-form')[0].reset();
});

// Search for any task detail and display those cards on each keypress.
$('#search').on('input', function () {
  const searchText = this.value.trim().toLowerCase();
  const filteredTasks = tasksInStorage.filter(task =>
    Object.values(task).some(
      value =>
        typeof value === 'string' && value.toLowerCase().includes(searchText)
    )
  );
  renderTasks(false, filteredTasks);
});

// Function to submit the task form
$('#task-form').submit(e => {
  e.preventDefault();

  // Read all values.
  const taskName = $('#task-name').val();
  const assignee = $('#assignee').val();
  const description = $('#description').val();
  const dueDate = $('#due-date').val();
  const priority = M.FormSelect.getInstance($('#priority')).input.value;

  // Do the validation for every input
  if (
    taskName !== '' &&
    assignee !== '' &&
    dueDate !== '' &&
    dateRegex.test(dueDate) &&
    description !== '' &&
    priority !== 'Choose Priority'
  ) {
    const taskData = { taskName, assignee, description, dueDate, priority };
    // Call add task or edit task based on editMode flag.
    if (editMode) {
      editTask(taskData, editTaskId);
    } else {
      addTask(taskData);
    }
  } else {
    // Else display an error message.
    M.toast({
      html: 'Please add all fields and ensure date format',
      classes: 'red',
    });
  }
});
