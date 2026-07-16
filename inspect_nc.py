from netCDF4 import Dataset

FILE = "backend/data/forecast/netcdf/wrfout_d01_nc.nc"

nc = Dataset(FILE)

print("\nVARIABLE NAMES\n")

for name in sorted(nc.variables.keys()):
    print(name)

nc.close()