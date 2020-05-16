'use strict'

class Task {

    constructor(id, description, important, privateTask, project, deadline, completed) {
        if (id) this.id = id
        this.description = description
        this.important = important
        this.privateTask = privateTask
        if (project) this.project = project
        if (deadline) this.deadline = deadline
        this.deadline = completed || false
    }

}

module.exports = Task