// state.js – Simple global state management using EventTarget

class AppState extends EventTarget {
  constructor() {
    super();
    this.user = null; // { id, email }
    this.activities = [];
    this.goals = [];
  }

  // Update user state and notify listeners
  setUser(user) {
    this.user = user;
    this.dispatchEvent(new CustomEvent('userChange', { detail: this.user }));
  }

  // Update activities and notify listeners
  setActivities(activities) {
    this.activities = activities;
    this.dispatchEvent(new CustomEvent('activitiesChange', { detail: this.activities }));
  }

  // Update goals and notify listeners
  setGoals(goals) {
    this.goals = goals;
    this.dispatchEvent(new CustomEvent('goalsChange', { detail: this.goals }));
  }
}

export const state = new AppState();
