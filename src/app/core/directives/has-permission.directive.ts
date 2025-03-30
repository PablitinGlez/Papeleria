import {
    Directive,
    Input,
    OnInit,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { Permission, RoleService } from '../services/role.service';
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission: keyof Permission = 'read';
  @Input() appHasPermissionElse?: TemplateRef<any>;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private roleService: RoleService,
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    console.log('Checking permission:', this.appHasPermission);

    this.roleService
      .hasPermission(this.appHasPermission)
      .subscribe((hasPermission) => {
        console.log('Permission result:', hasPermission);

        this.viewContainer.clear();

        if (hasPermission) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (this.appHasPermissionElse) {
          this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
        }
      });
  }
}