import { Component } from '@angular/core';
import { DataView } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

@Component({
  selector: 'app-foodtable',
  imports: [
    DataView,
    ButtonModule,
    Tag,
    CommonModule],
  templateUrl: './foodtable.component.html',
  styleUrl: './foodtable.component.scss'
})
export class FoodtableComponent {
  products = signal<any>([]);

  constructor() { }

  ngOnInit() {
    // this.productService.getProducts().then((data) => {
    //   this.products.set(data);
    // });
  }

  getSeverity(product: any) {
    switch (product.inventoryStatus) {
      case 'INSTOCK':
        return 'success';

      case 'LOWSTOCK':
        return 'warn';

      case 'OUTOFSTOCK':
        return 'danger';

      default:
        return null;
    }
  };
}
