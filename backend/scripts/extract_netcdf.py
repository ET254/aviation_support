#!/usr/bin/env python3
"""
Extract weather forecast data from WRF NetCDF files.

This script reads WRF (Weather Research and Forecasting) model output files
in NetCDF format and extracts key meteorological variables for aviation
weather decision support.

Usage:
    python extract_netcdf.py <path_to_netcdf_file>

Output:
    JSON with extracted variables and forecast data

Dependencies:
    - netCDF4: Python interface to netCDF library
    - numpy: Numerical Python library

Example:
    python extract_netcdf.py /data/wrfout_d01_2024010100.nc
"""

import sys
import json
import numpy as np
import traceback

try:
    from netCDF4 import Dataset
except ImportError:
    print(json.dumps({
        'success': False,
        'error': 'netCDF4 module not installed. Install with: pip install netcdf4',
        'variables': [],
        'dimensions': {},
        'attributes': {},
        'forecasts': []
    }))
    sys.exit(1)


def extract_variables(file_path, latitude=None, longitude=None):
    """Extract variables from NetCDF file."""
    try:
        ds = Dataset(file_path)
        
        # Get dimensions - convert to dict with int values
        dimensions = {}
        for dim_name, dim_obj in ds.dimensions.items():
            dimensions[dim_name] = len(dim_obj)
        
        # Get variables and their shapes
        variables = {}
        for var_name in ds.variables:
            var = ds.variables[var_name]
            variables[var_name] = {
                'shape': list(var.shape),  # Convert tuple to list
                'dtype': str(var.dtype),
                'dims': list(var.dimensions)  # Convert tuple to list
            }
        
        # Get attributes - convert to JSON-serializable format
        attributes = {}
        for attr_name in ds.ncattrs():
            attr_value = getattr(ds, attr_name)
            # Convert numpy types to Python types for JSON serialization
            if isinstance(attr_value, np.ndarray):
                attr_value = attr_value.tolist()
            elif isinstance(attr_value, (np.integer, np.floating)):
                attr_value = float(attr_value) if isinstance(attr_value, np.floating) else int(attr_value)
            elif isinstance(attr_value, bytes):
                attr_value = attr_value.decode('utf-8')
            attributes[attr_name] = attr_value

        # Determine grid point nearest the requested station location if available
        grid_point = (0, 0)
        if latitude is not None and longitude is not None:
            if 'XLAT' in ds.variables and 'XLONG' in ds.variables:
                try:
                    lat_data = ds.variables['XLAT'][:]
                    lon_data = ds.variables['XLONG'][:]
                    if lat_data.ndim >= 2 and lon_data.ndim >= 2:
                        min_dist = float('inf')
                        closest = (0, 0)
                        lat_array = lat_data[0] if lat_data.ndim == 3 else lat_data
                        lon_array = lon_data[0] if lon_data.ndim == 3 else lon_data
                        for i in range(lat_array.shape[0]):
                            for j in range(lat_array.shape[1]):
                                city_lat = float(lat_array[i, j])
                                city_lon = float(lon_array[i, j])
                                dist = (city_lat - latitude) ** 2 + (city_lon - longitude) ** 2
                                if dist < min_dist:
                                    min_dist = dist
                                    closest = (i, j)
                        grid_point = closest
                except Exception:
                    grid_point = (0, 0)

        # Extract key meteorological variables
        forecasts = []

        # Get dimensions for grid points
        if 'Times' in ds.variables:
            times = ds.variables['Times'][:]
            n_times = len(times)
            
            # Get first grid point data (or could iterate through multiple points)
            for t in range(min(n_times, 8)):  # Limit to 8 time steps
                try:
                    # Extract surface meteorology
                    data_point = {
                        'time_index': int(t),
                    }
                    
                    # Extract time string
                    try:
                        time_arr = times[t]
                        if isinstance(time_arr, np.ndarray):
                            time_str = ''.join([chr(c) if isinstance(c, (int, np.integer)) else c for c in time_arr])
                        else:
                            time_str = ''.join(time_arr) if hasattr(time_arr, '__iter__') else str(time_arr)
                        data_point['time_string'] = time_str
                    except Exception as e:
                        data_point['time_string'] = f'unknown'
                    
                    # Extract variables at the nearest grid point
                    i, j = grid_point
                    try:
                        if 'T2' in ds.variables:
                            t2_val = ds.variables['T2'][t, i, j]
                            # Convert numpy type to Python float
                            data_point['T2'] = float(t2_val)  # 2m temperature in K
                    except Exception:
                        pass
                    
                    try:
                        if 'U10' in ds.variables:
                            u10_val = ds.variables['U10'][t, i, j]
                            data_point['U10'] = float(u10_val)  # 10m U wind in m/s
                    except Exception:
                        pass
                    
                    try:
                        if 'V10' in ds.variables:
                            v10_val = ds.variables['V10'][t, i, j]
                            data_point['V10'] = float(v10_val)  # 10m V wind in m/s
                    except Exception:
                        pass
                    
                    try:
                        if 'PSFC' in ds.variables:
                            psfc_val = ds.variables['PSFC'][t, i, j]
                            data_point['PSFC'] = float(psfc_val)  # Surface pressure in Pa
                    except Exception:
                        pass
                    
                    try:
                        if 'RAINNC' in ds.variables:
                            rainnc_val = ds.variables['RAINNC'][t, i, j]
                            data_point['RAINNC'] = float(rainnc_val)  # Cumulative rain in mm
                    except Exception:
                        pass
                    
                    try:
                        if 'CLDFRA' in ds.variables:
                            if ds.variables['CLDFRA'].ndim == 4:
                                cldfra_val = ds.variables['CLDFRA'][t, 0, i, j]
                            else:
                                cldfra_val = ds.variables['CLDFRA'][t, i, j]
                            data_point['CLDFRA'] = float(cldfra_val)  # Cloud fraction (0-1)
                    except Exception:
                        pass
                    
                    try:
                        if 'HGT' in ds.variables:
                            if ds.variables['HGT'].ndim == 3:
                                hgt_val = ds.variables['HGT'][0, i, j]
                            else:
                                hgt_val = ds.variables['HGT'][i, j]
                            data_point['HGT'] = float(hgt_val)  # Terrain height in m
                    except Exception:
                        pass
                    
                    forecasts.append(data_point)
                
                except Exception:
                    pass  # Skip problematic time steps
        
        ds.close()
        
        result = {
            'success': True,
            'dimensions': dimensions,
            'variables': variables,
            'attributes': attributes,
            'forecasts': forecasts
        }
        
        return result
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc(),
            'dimensions': {},
            'variables': {},
            'attributes': {},
            'forecasts': []
        }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Missing file path argument',
            'usage': 'python extract_netcdf.py <path_to_netcdf_file> [latitude] [longitude]',
            'variables': [],
            'dimensions': {},
            'attributes': {},
            'forecasts': []
        }))
        sys.exit(1)
    
    file_path = sys.argv[1]
    latitude = float(sys.argv[2]) if len(sys.argv) > 2 else None
    longitude = float(sys.argv[3]) if len(sys.argv) > 3 else None
    result = extract_variables(file_path, latitude, longitude)
    print(json.dumps(result))
