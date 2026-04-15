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
  // Use 'Subject' terminology for clarity
  newSubjectName: string = '';
  subjects: string[] = [
    'Art', 'Business Studies', 'Computing', 'Drama', 'English',
    'Geography', 'History', 'Languages', 'Math', 'Music', 'Science', 'Technology'
  ];

  isAdding: boolean = false;

  constructor(public router: Router) {}

  ngOnInit() {
    const saved = localStorage.getItem('campus_departments');
    if (saved) {
      this.subjects = JSON.parse(saved);
    }
  }

  private saveToStorage() {
    localStorage.setItem('campus_departments', JSON.stringify(this.subjects));
  }

  onSignOut() {
    this.router.navigate(['/login']);
  }

  toggleAddBox() {
    this.isAdding = !this.isAdding;
    if (!this.isAdding) {
      this.newSubjectName = '';
    }
  }

  addSubject() {
    if (this.newSubjectName.trim()) {
      this.subjects.push(this.newSubjectName.trim());
      this.subjects.sort();
      this.saveToStorage();

      this.newSubjectName = '';
      this.isAdding = false;
    }
  }

  deleteSubject(index: number) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.subjects.splice(index, 1);
      this.saveToStorage();
    }
  }

  editSubject(index: number) {
    const updatedName = prompt('Edit Subject Name:', this.subjects[index]);
    if (updatedName && updatedName.trim()) {
      this.subjects[index] = updatedName.trim();
      this.subjects.sort();
      this.saveToStorage();
    }
  }
}