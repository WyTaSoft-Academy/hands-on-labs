# 📈 Suggested Dashboard Layout (Demo-friendly)

## KPIs (Top)

### Total Sales
```qlik
Sum(quantity * unit_price)
```

### Total Quantity
```qlik
Sum(quantity)
```

### Average Order Value
```qlik
Sum(quantity * unit_price) / Count(sale_id)
```

---

## 📊 Charts

### Sales by Region – Bar Chart
- **Dimension**: `region`
- **Measure**:
```qlik
Sum(quantity * unit_price)
```

### Sales by Category – Pie Chart
- **Dimension**: `category`
- **Measure**:
```qlik
Sum(quantity * unit_price)
```

### Monthly Sales Trend – Line Chart
- **Dimension**: `month_name`
- **Measure**:
```qlik
Sum(quantity * unit_price)
```

### Top 5 Products – Bar Chart
- **Dimension**: `product_name`
- **Measure**:
```qlik
Sum(quantity * unit_price)
```
- **Sort**: Descending by measure

---

## 🚀 Optional Enhancements

- Add **Year** filter
- Add **Sales target** table
- Create **Set Analysis KPI** (YTD Sales)
- Compare **Regions** (North vs South)
