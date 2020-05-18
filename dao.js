'use strict'

const Task = require('./task.js')
const moment = require('moment')

const sqlite = require('sqlite3')
const db = new sqlite.Database('./db/tasks.db', (err) => {
    if (err) throw err
})

const createTask = function (row) {
    return new Task(row.id, row.description, row.important === 1, row.private === 1, row.project, moment(row.deadline), row.completed === 1)
}

const isToday = function (date) {
    return date.isSame(moment(), 'day');
}

const isNextWeek = function (date) {
    const nextWeek = moment().add(1, 'weeks');
    const tomorrow = moment().add(1, 'days');
    return date.isAfter(tomorrow) && date.isBefore(nextWeek);
}

exports.getTasks = function (filter) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM tasks'
        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err)
            else {
                let tasks = rows.map((row) => createTask(row))
                if (filter) {
                    switch (filter.trim().toLowerCase()) {
                        case "important":
                            tasks = tasks.filter((t) => {
                                return t.important
                            })
                            break;
                        case "private":
                            tasks = tasks.filter((t) => {
                                return t.privateTask
                            })
                            break;
                        case "shared":
                            tasks = tasks.filter((t) => {
                                return !t.privateTask
                            })
                            break;
                        case "today":
                            tasks = tasks.filter((t) => {
                                if (t.deadline) return isToday(t.deadline)
                                else return false
                            })
                            break;
                        case "nextweek":
                            tasks = tasks.filter((t) => {
                                if (t.deadline) return isNextWeek(t.deadline)
                                else return false
                            })
                            break;
                        default:
                            tasks = []
                            break;
                    }
                }
                resolve(tasks)
            }
        })
    })
}


exports.getTask = function (taskID) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM tasks WHERE ID=?'
        db.get(sql, [taskID], (err, row) => {
            if (err)
                reject(err)
            if(row) {
                resolve(createTask(row))
            }
            else
                resolve(undefined)
        })
    })
}

exports.createTask = function (task) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO tasks(description, important, private, project, deadline, completed) VALUES (?,?,?,?,DATETIME(?),?)'
        db.run(sql, [task.description, task.important, task.privateTask, task.project, task.deadline, task.completed], function (err) {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                console.log(this.lastID)
                resolve(this.lastID)
            }
        })
    })
}

exports.updateTask = function (id, newTask) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE tasks SET description = ?, important = ?, private = ?, project = ?, deadline = DATETIME(?), completed = ? WHERE id = ?';
        db.run(sql, [newTask.description, newTask.important, newTask.privateTask, newTask.project, newTask.deadline, newTask.completed, id], (err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else
                resolve(null);
        })
    });
}

exports.deleteTask = function (id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM tasks WHERE id = ?'
        db.run(sql, [id], (err) => {
            if (err)
                reject(err)
            else
                resolve(null)
        })
    });
}
