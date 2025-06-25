import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { BackendTestUtil, BackendStatus } from '../../utils/backend-test.util';

@Component({
  selector: 'app-backend-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backend-status" [ngClass]="statusClass">
      <div class="status-indicator">
        <span class="status-dot" [ngClass]="dotClass"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
      
      <div class="status-details" *ngIf="backendStatus">
        <small>
          Tiempo de respuesta: {{ backendStatus.responseTime }}ms
          <span *ngIf="backendStatus.version"> | Versión: {{ backendStatus.version }}</span>
        </small>
        <div *ngIf="backendStatus.error" class="error-message">
          {{ backendStatus.error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backend-status {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      border: 1px solid;
      margin: 8px 0;
    }

    .backend-status.online {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }

    .backend-status.offline {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }

    .backend-status.checking {
      background-color: #fff3cd;
      border-color: #ffeaa7;
      color: #856404;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot.online {
      background-color: #28a745;
    }

    .status-dot.offline {
      background-color: #dc3545;
    }

    .status-dot.checking {
      background-color: #ffc107;
      animation: pulse 1s infinite;
    }

    .status-details {
      margin-top: 4px;
      padding-left: 16px;
    }

    .error-message {
      font-size: 0.75rem;
      margin-top: 2px;
      opacity: 0.8;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class BackendStatusComponent implements OnInit, OnDestroy {
  backendStatus: BackendStatus | null = null;
  statusText: string = 'Verificando...';
  statusClass: string = 'checking';
  dotClass: string = 'checking';
  
  private statusSubscription?: Subscription;

  constructor(private backendTestUtil: BackendTestUtil) {}

  ngOnInit(): void {
    this.checkStatus();
    
    // Verificar estado cada 30 segundos
    this.statusSubscription = interval(30000).subscribe(() => {
      this.checkStatus();
    });
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  private checkStatus(): void {
    this.backendTestUtil.checkBackendHealth().subscribe({
      next: (status: BackendStatus) => {
        this.backendStatus = status;
        this.updateStatusDisplay(status);
      },
      error: (error) => {
        this.backendStatus = {
          isOnline: false,
          responseTime: 0,
          error: 'Error al verificar el estado'
        };
        this.updateStatusDisplay(this.backendStatus);
      }
    });
  }

  private updateStatusDisplay(status: BackendStatus): void {
    if (status.isOnline) {
      this.statusText = 'Backend conectado';
      this.statusClass = 'online';
      this.dotClass = 'online';
    } else {
      this.statusText = 'Backend desconectado';
      this.statusClass = 'offline';
      this.dotClass = 'offline';
    }
  }
}