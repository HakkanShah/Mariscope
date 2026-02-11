# DOMAIN_SPEC.md
# Mariscope – FuelEU Domain Specification

This document defines official business logic for the project.

---

# 1. Constants

Target Intensity (2025):
89.3368 gCO2e/MJ

Energy factor:
41000 MJ per tonne of fuel

---

# 2. Compliance Balance (CB)

Formula:
CB = (Target − Actual) × Energy

Energy:
fuelConsumption × 41000

Interpretation:
CB > 0 → Surplus
CB < 0 → Deficit

---

# 3. Banking (Article 20)

Rules:
- Only surplus can be banked.
- Cannot bank negative values.
- Cannot apply more than banked.
- Bank reduces deficit when applied.

---

# 4. Pooling (Article 21)

Conditions:
- Sum of CB in pool ≥ 0
- Deficit ship cannot exit worse.
- Surplus ship cannot exit negative.

Algorithm:
1. Separate surplus and deficit ships.
2. Sort surplus descending.
3. Allocate greedily to deficits.
4. Stop when deficits resolved.

Return:
- cb_before
- cb_after
