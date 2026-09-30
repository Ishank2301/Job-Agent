<div align="center">

# Global Vaccination Analytics

**Data Cleaning, Exploratory Data Analysis, SQL Database, and Power BI Dashboard for Global Vaccination Data**

An end-to-end public health analytics project that cleans and analyzes five WHO vaccination datasets spanning 194+ countries, 70 vaccine antigens, and 40+ years — uncovering regional coverage gaps, disease reduction trends, and dose drop-off patterns through 15 EDA charts, 7 SQL queries, and a 4-page interactive Power BI dashboard.

</div>

---

## Overview

This project analyzes a multi-table WHO vaccination dataset spanning 5 relational Excel tables, 194+ countries, and records from 1940 to 2023 to achieve four primary objectives:

1. **Clean and validate** five raw WHO datasets covering vaccination coverage, disease incidence rates, reported cases, vaccine introduction status, and vaccine schedules.
2. **Explore and visualize** global vaccination trends, regional disparities, dose drop-off rates, and coverage-incidence correlations through 15 professional charts.
3. **Build a normalized SQL database** with 7 analytical queries answering real public health business questions around resource allocation, disease reduction, and vaccine introduction gaps.
4. **Deliver interactive Power BI dashboards** connected to the SQL database through 4 themed pages covering coverage overview, disease trends, vaccine program analysis, and KPI monitoring.

---

## Data Pipeline

The raw dataset spans 5 relational Excel tables. The Coverage table (399,859 rows) is the analytical core; all other tables provide disease, introduction, and schedule context joined on ISO country codes.

| Step | Action |
|------|--------|
| 1 | Loaded all 5 Excel tables: Coverage, Incidence Rate, Reported Cases, Vaccine Introduction, Vaccine Schedule |
| 2 | Filtered all tables to `GROUP == 'COUNTRIES'` to remove regional and global aggregate rows |
| 3 | Dropped rows with nulls in critical identifier columns (CODE, NAME, YEAR, ANTIGEN/DISEASE) |
| 4 | Converted `YEAR` from float64 to integer via `astype(int)` for SQL JOIN and sort compatibility |
| 5 | Stripped leading/trailing whitespace from all string columns to prevent join failures |
| 6 | Capped `COVERAGE` at 100% via `clip(upper=100)` to correct administrative overcounting artifacts |
| 7 | Dropped rows where `COVERAGE` is null — the primary analysis metric requires non-null values |
| 8 | Removed rows where `CASES < 0` — negative case counts are data entry errors |
| 9 | Standardized `INTRO` column to only 'Yes' or 'No' values in the Introduction table |
| 10 | Filled null `GEOAREA` with 'UNKNOWN' in the Schedule table to prevent SQL GROUP BY null propagation |

**Records after cleaning:**

| Table | Original | Cleaned | Removed |
|-------|----------|---------|---------|
| Coverage Data | 399,859 | 230,477 | 169,382 |
| Incidence Rate Data | 84,946 | 61,584 | 23,362 |
| Reported Cases Data | 84,870 | 65,470 | 19,400 |
| Vaccine Introduction | 138,321 | 138,320 | 1 |
| Vaccine Schedule | 8,053 | 8,052 | 1 |

---

## SQL-Based Exploration

Seven production-style analytical queries were run via Python's built-in `sqlite3` module on a normalized SQLite database (`vaccination.db`) loaded from all five cleaned DataFrames:

| Query | Business Question Answered |
|-------|---------------------------|
| Q1 | Average vaccination coverage by WHO region (2010–2023) |
| Q2 | Countries with below 50% coverage for priority vaccines (BCG, DTP3, MCV1, POL3, HepB3) |
| Q3 | Global disease cases trend by year — tracking impact of vaccination over time |
| Q4 | Disease case reduction pre-vs-post 2000 (CTE-based percentage reduction calculation) |
| Q5 | Vaccine introduction rate by WHO region — identifying introduction disparities |
| Q6 | DTP dose drop-off coverage by WHO region (DTPCV1 vs DTPCV3 comparison) |
| Q7 | Countries with highest average disease incidence rates — outbreak response targeting |

---

## Exploratory Data Analysis

15 charts were produced across three levels of analysis covering all major project business questions.

### Univariate Analysis

| Chart | Visual | Insight |
|-------|--------|---------|
| Chart 1 | Top 10 Countries by Average Vaccination Coverage | European and Caribbean nations lead with 95%+ average coverage |
| Chart 2 | Distribution of Vaccination Coverage (%) | Bimodal distribution — peak at 90–100% with a secondary mass at 0–30% |
| Chart 3 | Top 10 Diseases by Total Reported Cases | Pertussis and Measles dominate global case burden historically |
| Chart 4 | Distribution of Disease Incidence Rates | Extremely right-skewed — majority near zero, confirming broad vaccination success |
| Chart 5 | Vaccine Introductions by WHO Region | EURO and AMRO lead in total introductions; AFRO has fewest despite highest burden |

### Bivariate Analysis

| Chart | Visual | Insight |
|-------|--------|---------|
| Chart 6 | Vaccination Coverage vs Disease Incidence (Scatter + Pearson r) | Clear negative correlation — higher coverage leads to lower incidence rates |
| Chart 7 | Total Global Disease Cases Trend Over Years | Consistent downward trajectory from 1980s onward following EPI expansion |
| Chart 8 | Vaccination Coverage Trend by WHO Region Over Years | EURO/AMRO lead throughout; AFRO shows gradual improvement from 2000s |
| Chart 9 | Top Diseases with Greatest Case Reduction (Pre vs Post 2000) | Poliomyelitis and Diphtheria show greatest reductions post-vaccination scaling |
| Chart 10 | Vaccine Dose Drop-off — DTPCV1 vs DTPCV3 | Measurable percentage-point drop between 1st and 3rd DTP doses globally |

### Multivariate Analysis

| Chart | Visual | Insight |
|-------|--------|---------|
| Chart 11 | Correlation Heatmap — Coverage, Incidence Rate, Cases | Coverage negatively correlated with both incidence rate and total cases |
| Chart 12 | Priority Vaccine Coverage by WHO Region (Heatmap) | AFRO critically low on DTPCV3 and HEPB3; EURO achieves 90%+ across all antigens |
| Chart 13 | High Incidence Despite High Coverage (Scatter Quadrant) | Identifies outlier countries where coverage does not translate to disease protection |
| Chart 14 | Coverage Trend for Priority Antigens Over Years (Multi-line) | BCG maintains highest baseline; MCV1 approaching but not reaching 95% WHO threshold |
| Chart 15 | Bottom 10 Countries by Average Vaccination Coverage | AFRO and EMRO dominate — direct input for resource allocation prioritization |

---

## Power BI Dashboard

Four interactive dashboard pages were built in Power BI Desktop, connected to `vaccination.db` via the SQLite ODBC driver.

| Page | Visuals |
|------|---------|
| **Coverage Overview** | Geographical map (coverage by country), Bar chart (coverage by WHO region), Year slicer, Antigen slicer |
| **Disease Trends** | Line chart (global cases over time), Bar chart (top diseases by cases), Scatter plot (coverage vs incidence rate), Disease slicer |
| **Vaccine Program Analysis** | Bar chart (DTP dose drop-off DTPCV1 vs DTPCV3), Line chart (priority antigen coverage trends), Matrix heatmap (coverage by WHO region and antigen), Bar chart (bottom countries by coverage) |
| **KPI Dashboard** | Cards (global average coverage, total reported cases), Gauge (coverage vs 95% WHO target), Table (highest incidence rate countries) |

---

## Key Findings

- **Negative correlation confirmed** — higher vaccination coverage directly leads to lower disease incidence rates at the country-year level, validating the core epidemiological justification for vaccination programs.

- **AFRO region is the highest-priority target** for resource allocation — it consistently shows the lowest average coverage across all priority vaccines (BCG, DTP3, MCV1, POL3, HepB3) across all time periods.

- **DTP dose drop-off is a measurable global challenge** — a percentage-point gap exists between DTPCV1 (1st dose) and DTPCV3 (3rd dose) globally, with AFRO showing the largest absolute gap, confirming that dose completion is the key operational bottleneck.

- **Poliomyelitis and Diphtheria show the greatest post-2000 case reductions**, directly attributable to sustained WHO EPI vaccination programs — demonstrating the long-term compounding return on investment in immunization.

- **BCG achieves the highest coverage globally** because it is administered at birth alongside maternity care, making it logistically simpler to maintain high coverage without separate follow-up visits.

- **Measles (MCV1) remains the highest resurgence risk** — global average coverage has not yet reached the 95% herd immunity threshold required to prevent outbreak transmission.

---

## Repository Structure

```
Vaccination-Data-Analysis/
│
├── Global_Vaccination_Analytics.ipynb       ← Main notebook (108 cells, 40 code, 68 markdown)
├── requirements.txt                 ← Python dependencies (5 packages)
├── .gitignore                       ← Git ignore rules
├── README.md                        ← This file
├── Documentation.md                 ← Full project documentation
│
├── Vaccination project/             ← Raw dataset folder (not tracked by git)
│   ├── coverage-data.xlsx
│   ├── incidence-rate-data.xlsx
│   ├── reported-cases-data.xlsx
│   ├── vaccine-introduction-data.xlsx
│   └── vaccine-schedule-data.xlsx
│
├── database/                        ← Generated after running notebook
│   └── vaccination.db               ← SQLite database (5 cleaned tables, 7 queries)
│
└── images/                          ← Generated after running notebook (15 charts)
    ├── chart1_top10_countries_coverage.png
    ├── chart2_coverage_distribution.png
    ├── chart3_top10_diseases_cases.png
    ├── chart4_incidence_distribution.png
    ├── chart5_intro_by_region.png
    ├── chart6_coverage_vs_incidence.png
    ├── chart7_disease_cases_trend.png
    ├── chart8_coverage_by_region_trend.png
    ├── chart9_case_reduction.png
    ├── chart10_dtp_dose_dropoff.png
    ├── chart11_correlation_heatmap.png
    ├── chart12_priority_vaccine_heatmap.png
    ├── chart13_high_incidence_high_coverage.png
    ├── chart14_priority_antigen_trend.png
    └── chart15_lowest_coverage_countries.png
```

---

## Business Recommendations

**Resource Allocation —** Prioritize the countries identified in SQL Query 2 with below 50% average coverage for priority vaccines. Focus investment on cold chain infrastructure, health worker training, and community outreach in AFRO and EMRO regions.

**Disease Prevention —** Scale and maintain Measles (MCV1) coverage globally to reach the 95% herd immunity threshold. Measles is the most at-risk vaccine-preventable disease for resurgence given persistent coverage gaps.

**Dose Completion —** Implement active follow-up mechanisms (SMS reminders, community health worker home visits) for DTPCV3, POL3, and HEPB3 in AFRO and EMRO to close the measurable dose drop-off gap between first and third vaccination visits.

**Global Health Policy —** The vaccine introduction disparity between EURO/AMRO and AFRO/EMRO should directly inform GAVI funding priorities, particularly for newer vaccines (Rotavirus, PCV, HPV) widely adopted in high-income regions but absent from many low-income country schedules.

---

## Running the Project

### Python Notebook

```bash
git clone https://github.com/Ishank2301/Global-Vaccination-Analytics.git
cd Global-Vaccination-Analytics

pip install -r requirements.txt
```

Place the `Vaccination project/` folder in the same directory as the notebook, then run:

```bash
jupyter notebook Global_Vaccination_Analytics.ipynb
```

Run all cells top to bottom. This generates `database/vaccination.db` and all 15 chart images in `images/`.

### Power BI Dashboard

1. Install SQLite ODBC driver from **http://www.ch-werner.de/sqliteodbc/** (`sqliteodbc_w64.exe`)
2. Open **ODBC Data Sources (64-bit)** → System DSN → Add → SQLite3 ODBC Driver
3. Set Data Source Name: `vaccination_db` and point to `database/vaccination.db`
4. Open **Power BI Desktop** → Get Data → ODBC → `vaccination_db` → Load all 5 tables
5. Set relationships in Model view: join all tables to `vaccine_introduction` on `country_code`
6. Open `vaccination.pbix` to view the completed dashboard

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.10+ | Data processing, EDA, and SQL database creation |
| pandas | 3.0.2 | DataFrame operations, groupby, merge, read_excel |
| numpy | 2.4.4 | Numerical operations and quantile calculations |
| matplotlib | 3.10.8 | All 15 static chart generations |
| seaborn | 0.13.2 | Heatmaps and correlation visualizations |
| openpyxl | 3.1.5 | Reading .xlsx dataset files |
| sqlite3 | Built-in | SQL database creation and 7 analytical queries |
| Power BI Desktop | Latest | 4-page interactive dashboard |
| SQLite ODBC Driver | Latest | Connecting Power BI to vaccination.db |

---

## Author

**Ishank — AI/ML Engineer**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/Ishank2301)
[![GitHub](https://img.shields.io/badge/GitHub-121011?style=flat-square&logo=github&logoColor=white)](https://github.com/Ishank2301)
[![Kaggle](https://img.shields.io/badge/Kaggle-20BEFF?style=flat-square&logo=kaggle&logoColor=white)](https://www.kaggle.com/Ishank2301)
[![LeetCode](https://img.shields.io/badge/LeetCode-181717?style=flat-square&logo=leetcode&logoColor=FFA116)](https://leetcode.com/u/Ishank2301/)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:ishankmishra579@gmail.com)


---

<div align="center">

*If this project was useful, a ⭐ on the repository is appreciated.*

</div>