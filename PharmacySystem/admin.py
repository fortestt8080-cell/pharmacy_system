from django.contrib import admin
from  PharmacySystem.models import *

# Register your models here.

admin.site.register(Medicines)
admin.site.register(Suppliers)
admin.site.register(Sales)
admin.site.register(MedicineDetails)