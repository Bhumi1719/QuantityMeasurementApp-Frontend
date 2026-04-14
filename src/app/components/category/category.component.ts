import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConverterService, QuantityDTO } from '../../services/converter.service';
import { CATEGORIES } from '../../models/units.data';
import { Operation } from '../../models/qms.models';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  category = '';
  catIcon = '';
  catLabel = '';
  unitKeys: string[] = [];
  unitLabels: Record<string, string> = {};

  fromUnit = '';
  toUnit = '';
  secondUnit = '';
  inputValue: number | null = null;
  inputValue2: number | null = null;
  currentOp: Operation = 'convert';

  resultValue = '—';
  resultDetail = '';
  errorMsg = '';
  resultPop = false;
  isLoading = false;

  ops: { key: Operation; label: string }[] = [
    { key: 'convert',  label: '🔄 Convert'  },
    { key: 'add',      label: '➕ Add'       },
    { key: 'subtract', label: '➖ Subtract'  },
    { key: 'multiply', label: '✖ Multiply'  },
    { key: 'divide',   label: '➗ Divide'    },
    { key: 'compare',  label: '⚖ Compare'   },
  ];

  get needsSecond(): boolean {
    return ['add','subtract','multiply','divide','compare'].includes(this.currentOp);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private converter: ConverterService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.category = params['category'];
      const cat = CATEGORIES[this.category];
      if (!cat) { this.router.navigate(['/']); return; }
      this.catIcon  = cat.icon;
      this.catLabel = cat.label;
      this.unitKeys = Object.keys(cat.units);
      this.unitLabels = {};
      this.unitKeys.forEach(k => this.unitLabels[k] = cat.units[k].label);
      this.fromUnit   = this.unitKeys[0];
      this.toUnit     = this.unitKeys[1] || this.unitKeys[0];
      this.secondUnit = this.unitKeys[0];
      this.reset();
    });
  }

  reset(): void {
    this.inputValue  = null;
    this.inputValue2 = null;
    this.resultValue = '—';
    this.resultDetail = '';
    this.errorMsg = '';
  }

  selectOp(op: Operation): void {
    this.currentOp = op;
    this.resultValue = '—';
    this.resultDetail = '';
    this.errorMsg = '';
    if (op === 'convert') this.runOperation();
  }

  swapUnits(): void {
    [this.fromUnit, this.toUnit] = [this.toUnit, this.fromUnit];
    if (this.currentOp === 'convert') this.runOperation();
  }

  onInputChange(): void {
    if (this.currentOp === 'convert') this.runOperation();
  }

  runOperation(): void {
    this.errorMsg = '';
    const v1 = Number(this.inputValue);
    const v2 = Number(this.inputValue2);

    try {
      let expr = '';
      let res  = '';

      if (this.currentOp === 'convert') {
        if (this.inputValue === null || String(this.inputValue) === '') return;
        // Local calculation (instant) + save to backend
        const result = this.converter.convertLocal(this.category, this.fromUnit, this.toUnit, v1);
        res  = `${this.converter.fmt(result)} ${this.unitLabels[this.toUnit]}`;
        expr = `${v1} ${this.unitLabels[this.fromUnit]} → ${this.unitLabels[this.toUnit]}`;
        this.resultValue  = res;
        this.resultDetail = expr;
        this.triggerPop();

        // Save to backend asynchronously
        const dto: QuantityDTO = { value: v1, unit: this.fromUnit.toUpperCase(), type: this.category.toUpperCase() };
        this.converter.convertApi(dto, this.toUnit.toUpperCase()).subscribe({ error: () => {} });

      } else if (this.currentOp === 'compare') {
        const cmp = this.converter.compareLocal(this.category, v1, this.fromUnit, v2, this.secondUnit);
        this.resultValue  = cmp;
        this.resultDetail = '';
        this.triggerPop();

      } else {
        const { result, unit } = this.converter.arithmeticLocal(this.category, this.currentOp, v1, this.fromUnit, v2, this.secondUnit);
        res  = `${this.converter.fmt(result)} ${this.unitLabels[unit]}`;
        expr = `${v1} ${this.unitLabels[this.fromUnit]} ${this.opSymbol} ${v2} ${this.unitLabels[this.secondUnit]}`;
        this.resultValue  = res;
        this.resultDetail = expr;
        this.triggerPop();

        // Save add operations to backend
        if (this.currentOp === 'add') {
          const q1: QuantityDTO = { value: v1, unit: this.fromUnit.toUpperCase(), type: this.category.toUpperCase() };
          const q2: QuantityDTO = { value: v2, unit: this.secondUnit.toUpperCase(), type: this.category.toUpperCase() };
          this.converter.addApi(q1, q2).subscribe({ error: () => {} });
        }
      }
    } catch (e: any) {
      this.errorMsg = e.message;
    }
  }

  get opSymbol(): string {
    const map: Record<string, string> = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
    return map[this.currentOp] || '';
  }

  triggerPop(): void {
    this.resultPop = false;
    setTimeout(() => this.resultPop = true, 10);
  }

  goBack(): void { this.router.navigate(['/']); }
}
