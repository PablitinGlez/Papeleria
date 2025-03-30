import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    OnInit,
    Renderer2,
} from '@angular/core';
import { Permission, RoleService } from '../services/role.service';

@Directive({
  selector: '[appRoleButton]',
  standalone: true,
})
export class RoleButtonDirective implements OnInit {
  @Input() appRoleButton: keyof Permission = 'read';
  @Input() tooltipMessage: string =
    'No tienes permiso para realizar esta acción';

  private hasPermission = true;
  private tooltip: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private roleService: RoleService,
  ) {}

  ngOnInit(): void {
    this.updateButtonState();
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.hasPermission) {
      event.stopPropagation();
      event.preventDefault();
      this.showTooltip();
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.hasPermission) {
      this.showTooltip();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  private showTooltip(): void {
    if (this.tooltip) {
      return;
    }

    // Crear el tooltip
    this.tooltip = this.renderer.createElement('div');
    const text = this.renderer.createText(this.tooltipMessage);

    // Estilos para el tooltip
    this.renderer.appendChild(this.tooltip, text);
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'background', 'rgba(0, 0, 0, 0.8)');
    this.renderer.setStyle(this.tooltip, 'color', 'white');
    this.renderer.setStyle(this.tooltip, 'padding', '5px 10px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltip, 'font-size', '12px');
    this.renderer.setStyle(this.tooltip, 'z-index', '1000');
    this.renderer.setStyle(this.tooltip, 'top', '100%');
    this.renderer.setStyle(this.tooltip, 'left', '50%');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(this.tooltip, 'margin-left', '80px');
        this.renderer.setStyle(this.tooltip, 'margin-top', '8px');
    this.renderer.setStyle(this.tooltip, 'white-space', 'nowrap');

    // Añadir el tooltip al DOM
    const body = document.body;
    this.renderer.appendChild(body, this.tooltip);

    // Posicionar el tooltip debajo del botón
    const buttonRect = this.el.nativeElement.getBoundingClientRect();
    if (this.tooltip) {
      const tooltipRect = this.tooltip.getBoundingClientRect();

      const top = buttonRect.bottom + window.scrollY;
      const left =
        buttonRect.left +
        buttonRect.width / 2 -
        tooltipRect.width / 2 +
        window.scrollX;

      this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
      this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
    }
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }
  }

  private updateButtonState(): void {
    this.roleService
      .hasPermission(this.appRoleButton)
      .subscribe((hasPermission) => {
        this.hasPermission = hasPermission;

        if (!hasPermission) {
          // Estilos para botón deshabilitado
          this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.5');
          this.renderer.setStyle(
            this.el.nativeElement,
            'cursor',
            'not-allowed',
          );
          this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
        }
      });
  }
}
