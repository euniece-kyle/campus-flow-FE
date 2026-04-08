import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router, RouterModule } from '@angular/router';



@Component({

  selector: 'app-department',

  standalone: true,

  imports: [CommonModule, FormsModule, RouterModule],

  templateUrl: './department.html',

  styleUrls: ['./department.scss']

})

export class DepartmentComponent implements OnInit {

  newDepartmentName: string = '';

 

  // Default list if nothing is in storage

  departments: string[] = [

    'Art', 'Business Studies', 'Computing', 'Drama', 'English',

    'Geography', 'History', 'Languages', 'Math', 'Music', 'Science', 'Technology'

  ];



  // CHANGE: Added 'public' so the HTML can see 'router.url'

  constructor(public router: Router) {}



  // LOAD DATA when the page opens

  ngOnInit() {

    const saved = localStorage.getItem('campus_departments');

    if (saved) {

      this.departments = JSON.parse(saved);

    }

  }



  // HELPER to save to the browser "hard drive"

  private saveToStorage() {

    localStorage.setItem('campus_departments', JSON.stringify(this.departments));

  }



  onSignOut() {

    this.router.navigate(['/login']);

  }



  addDepartment() {

    if (this.newDepartmentName.trim()) {

      this.departments.push(this.newDepartmentName.trim());

      this.departments.sort();

      this.saveToStorage();

      this.newDepartmentName = '';

    }

  }



  deleteDepartment(index: number) {

    if (confirm('Are you sure you want to delete this department?')) {

      this.departments.splice(index, 1);

      this.saveToStorage();

    }

  }



  editDepartment(index: number) {

    const updatedName = prompt('Edit Department Name:', this.departments[index]);

    if (updatedName && updatedName.trim()) {

      this.departments[index] = updatedName.trim();

      this.departments.sort();

      this.saveToStorage();

    }

  }

}