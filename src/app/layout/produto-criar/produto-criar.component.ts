import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produto, ProdutoMetric } from '../../models/products.model';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-produto-criar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './produto-criar.component.html',
  styleUrl: './produto-criar.component.css',
})
export class ProdutoCriarComponent {
  private fb = inject(FormBuilder);
  private productsService = inject(ProductService);

  loading = false;
  activeLangTab: 'en' | 'pt' | 'fr' = 'en';
  successMessage = '';
  errorMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    descriptionPT: [''],
    descriptionFR: [''],
    metrics: this.fb.array([]),
    features: this.fb.array([]),
    coverUrl: [''],
    featuredImageUrl: [''],
    ctaText: [''],
    ctaUrl: [''],
    productGuideUrl: [''],
    productSector: [''],
    productCategory: ['']
  });

  /* =====================================================
     GETTERS
  ===================================================== */

  get metrics(): FormArray {
    return this.form.get('metrics') as FormArray;
  }

  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }

  setLangTab(lang: 'en' | 'pt' | 'fr'): void {
    this.activeLangTab = lang;
  }

  hasLangContent(controlName: 'description' | 'descriptionPT' | 'descriptionFR'): boolean {
    const val = this.form.get(controlName)?.value;
    return typeof val === 'string' && val.trim().length > 0;
  }

  clearControl(controlName: string): void {
    this.form.get(controlName)?.setValue('');
  }

  /* =====================================================
     METRICS
  ===================================================== */

  addMetric(): void {
    const metricGroup = this.fb.group({
      title: ['', Validators.required],
      value: ['', Validators.required]
    });
    this.metrics.push(metricGroup);
  }

  removeMetric(index: number): void {
    this.metrics.removeAt(index);
  }

  /* =====================================================
     FEATURES
  ===================================================== */

  addFeature(): void {
    this.features.push(
      this.fb.control('', Validators.required)
    );
  }

  removeFeature(index: number): void {
    this.features.removeAt(index);
  }

  /* =====================================================
     SUBMIT
  ===================================================== */

  async submit(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.get('description')?.invalid) {
        this.activeLangTab = 'en';
      }
      this.errorMessage = 'Por favor preencha os campos obrigatórios (Nome e Descrição EN).';
      return;
    }

    this.loading = true;

    const formValue = this.form.value;

    const product: Produto = {
      id: Date.now(),
      name: formValue.name || '',
      description: formValue.description || '',
      descriptionPT: formValue.descriptionPT || '',
      descriptionFR: formValue.descriptionFR || '',
      metrics: (formValue.metrics || []) as ProdutoMetric[],
      features: (formValue.features || []) as string[],
      coverUrl: formValue.coverUrl || '',
      featuredImageUrl: formValue.featuredImageUrl || '',
      ctaText: formValue.ctaText || '',
      ctaUrl: formValue.ctaUrl || '',
      productGuideUrl: formValue.productGuideUrl || '',
      productSector: formValue.productSector || '',
      productCategory: formValue.productCategory || ''
    };

    try {
      await this.productsService.createProduct(product);
      this.resetForm();
      this.successMessage = 'Produto adicionado com sucesso ao catálogo global.';
      setTimeout(() => {
        this.successMessage = '';
      }, 4500);
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      this.errorMessage = 'Ocorreu um erro ao guardar o produto. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  /* =====================================================
     RESET
  ===================================================== */

  resetForm(): void {
    this.form.reset({
      name: '',
      description: '',
      descriptionPT: '',
      descriptionFR: '',
      coverUrl: '',
      featuredImageUrl: '',
      productGuideUrl: '',
      ctaText: '',
      ctaUrl: '',
      productSector: '',
      productCategory: ''
    });

    while (this.metrics.length) {
      this.metrics.removeAt(0);
    }

    while (this.features.length) {
      this.features.removeAt(0);
    }

    this.activeLangTab = 'en';
  }
}
