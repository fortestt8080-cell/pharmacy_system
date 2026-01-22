from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('logout/', views.user_logout, name='logout'),
    
    # Medicines
    path('medicines/', views.medicines, name='medicines'),
    path('edit_medicine/<int:id>/', views.edit_medicine, name='edit_medicine'),
    path('delete_medicine/<int:id>/', views.delete_medicine, name='delete_medicine'),

    # Suppliers
    path('suppliers/', views.suppliers, name='suppliers'),
    path('add_supplier/', views.add_supplier, name='add_supplier'),
    path('edit_supplier/<int:id>/', views.edit_supplier, name='edit_supplier'),
    path('delete_supplier/<int:id>/', views.delete_supplier, name='delete_supplier'),

    # Sales
    path('sales/', views.sales, name='sales'),
    path('add_sale/', views.add_sale, name='add_sale'),
    path('delete_sale/<int:id>/', views.delete_sale, name='delete_sale'),
]