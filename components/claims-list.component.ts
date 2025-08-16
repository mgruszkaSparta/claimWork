// @ts-nocheck
/* eslint-disable */
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface Claim {
  // Define properties for claims as needed
}

export class ClaimsListComponent implements AfterViewInit {
  displayedColumns = ['claimObjectType','insurerNumber','number','registrationNumber','claimHandler','customerGroupName','registrationDate','claimRiskTypeId','StatusId','actions'];
  dataSource = new MatTableDataSource<Claim>();

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }
}
