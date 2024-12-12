import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  template: `
    <div class="modal">
      <div class="modal-content">
        <h2>Fetch Options</h2>
        <p>Do you want to fetch all recent committed files together or one by one?</p>
        <button (click)="fetchAll()">Fetch All Together</button>
        <button (click)="fetchOneByOne()">Fetch One by One</button>
        <button (click)="close()">Cancel</button>
      </div>
    </div>
  `,
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  @Output() fetchOption = new EventEmitter<string>();

  fetchAll() {
    this.fetchOption.emit('all');
    this.close();
  }

  fetchOneByOne() {
    this.fetchOption.emit('oneByOne');
    this.close();
  }

  close() {
    // Close the modal
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.classList.remove('show');
    } else {
      console.error('Modal element not found.');
    }
  }
  
}
