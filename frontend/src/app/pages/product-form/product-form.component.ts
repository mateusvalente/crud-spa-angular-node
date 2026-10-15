import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  productId: number | null = null;
  loading = false;
  saving = false;
  error = '';

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(120),
    ]],
    price: [0, [
      Validators.required,
      Validators.min(0),
    ]],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      return;
    }

    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      this.error = 'ID inválido.';
      return;
    }

    this.productId = id;
    this.loadProduct(id);
  }

  get isEditing(): boolean {
    return this.productId !== null;
  }

  loadProduct(id: number): void {
    this.loading = true;

    this.productService.findById(id).subscribe({
      next: (product) => {
        this.form.setValue({
          name: product.name,
          price: Number(product.price),
        });

        this.loading = false;
      },
      error: () => {
        this.error = 'Produto não encontrado.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const payload = this.form.getRawValue();

    const request$ = this.productId === null
      ? this.productService.create(payload)
      : this.productService.update(this.productId, payload);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/produtos']);
      },
      error: () => {
        this.error = 'Não foi possível salvar o produto.';
        this.saving = false;
      },
    });
  }
}
