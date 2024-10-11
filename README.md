# Todo App List
You're given some existing HTML for a Todo List app. Your goal is to add and improve its functionality.

## Part 1: Basic Functionality

### Requirements
- Users should be able to add new tasks by clicking the "Submit" button or pressing "Enter" when focused on the input field.
- Once a task is added, the input field should automatically clear. 
- Each task should have a "Delete" button, allowing users to remove tasks from the list.

## Part 2: Validations & Persistence
### Requirements
#### Validations
- Users should not be able to submit empty tasks. 
- Prevent users from adding duplicate tasks.

#### State Persistence
- After a task is added, it should persist even after the page is reloaded. 
- Tasks should reappear in the order as they were before.

## Part 3: Advanced Task Management
### Requirements
#### Task Prioritization:
- Add the ability for users to mark tasks as "High Priority." High-priority tasks should automatically move to the top of the list.

#### Real-Time Synchronization Across Tabs:
- Ensure that tasks stay synchronized across multiple open tabs in real time. If a user modifies the task list (adds, deletes, edits, or reorders tasks) in one tab, the changes should immediately reflect in other open tabs without requiring a page reload. 

## Notes
- The focus of this question is on functionality, not the styling. There's no need to write any custom CSS.
- You may modify the markup (e.g. adding ids, data attributes, replacing some tags, etc), but the result should remain the same visually.