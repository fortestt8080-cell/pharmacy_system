from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.db.models import F, Sum
from .models import *


# ==================== Dashboard ====================

@login_required(login_url='login')
def index(request):
    """Display the main dashboard with statistics."""
    low_stock_count = Medicines.objects.filter(Quantity__lt=F('MinStock')).count()
    total_sales = Sales.objects.aggregate(total=Sum('Unit_Price'))['total'] or 0
    
    context = {
        'med': Medicines.objects.count(),
        'low_stock_count': low_stock_count,
        'total_sales': total_sales,
        'su': Suppliers.objects.count(),
        'all_sales': Sales.objects.all()
    }
    return render(request, "dashboard.html", context)


# ==================== Authentication ====================

def login(request):
    """Handle user login."""
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            auth_login(request, user)
            messages.success(request, 'Signed in successfully!')
            return redirect('index')
        else:
            messages.error(request, 'Email or password incorrect')
    
    return render(request, "login.html")


def register(request):
    """Handle new user registration."""
    if request.method == 'POST':
        fullname = request.POST.get('fullname')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        # Validation
        if password1 != password2:
            messages.error(request, 'Passwords do not match')
            return render(request, "register.html")
        
        if User.objects.filter(username=email).exists():
            messages.error(request, 'This email is already registered')
            return render(request, "register.html")
        
        # Create user (using email as username, storing fullname in first_name)
        user = User.objects.create_user(username=email, email=email, password=password1)
        user.first_name = fullname  # Store full name
        user.phone = phone  # Store phone number
        user.save()
        
        messages.success(request, 'Account created successfully! You can log in now')
        return redirect('login')
    
    return render(request, "register.html")


def user_logout(request):
    """Handle user logout."""
    auth_logout(request)
    messages.success(request, 'You have been logged out successfully!')
    return redirect('login')


# ==================== Medicines ====================

@login_required(login_url='login')
def medicines(request):
    """Display all medicines and handle adding new medicine."""
    if request.method == 'POST':
        code = request.POST.get('code')
        
        # Check for duplicate code
        if Medicines.objects.filter(Code=code).exists():
            messages.error(request, f"Error: Medicine with code '{code}' already exists!")
            return redirect('medicines')
        
        # Create new medicine
        new_medicine = Medicines.objects.create(
            Name=request.POST.get('name'),
            Code=code,
            Category=request.POST.get('category'),
            Quantity=request.POST.get('quantity'),
            MinStock=request.POST.get('min_stock'),
            Price=request.POST.get('price'),
            Expiry=request.POST.get('expiry')
        )

        # Add details if provided
        description = request.POST.get('description')
        side_effects = request.POST.get('side_effects')
        box_shape = request.FILES.get('box_shape')

        if description or side_effects or box_shape:
            MedicineDetails.objects.create(
                medicine=new_medicine, 
                description=description,
                side_effects=side_effects,
                Box_Shape=box_shape
            )

        messages.success(request, "Medicine added successfully!")
        return redirect('medicines')
    
    context = {
        'all_medicines': Medicines.objects.all().order_by('-Number'),
        'cat_choices': Medicines.Category_choices
    }
    return render(request, "medicines.html", context)


@login_required(login_url='login')
def edit_medicine(request, id):
    """Edit an existing medicine."""
    medicine = get_object_or_404(Medicines, pk=id)
    
    if request.method == 'POST':
        medicine.Name = request.POST.get('name')
        medicine.Code = request.POST.get('code')
        medicine.Category = request.POST.get('category')
        medicine.Quantity = request.POST.get('quantity')
        medicine.MinStock = request.POST.get('min_stock')
        medicine.Price = request.POST.get('price')
        medicine.Expiry = request.POST.get('expiry')
        medicine.save()
        messages.success(request, "Medicine updated successfully!")
    
    return redirect('medicines')


@login_required(login_url='login')
def delete_medicine(request, id):
    """Delete a medicine."""
    medicine = get_object_or_404(Medicines, pk=id)
    medicine.delete()
    messages.success(request, "Medicine deleted successfully!")
    return redirect('medicines')


# ==================== Suppliers ====================

@login_required(login_url='login')
def suppliers(request):
    """Display all suppliers."""
    context = {
        'all_supp': Suppliers.objects.all().order_by('-id')
    }
    return render(request, "suppliers.html", context)


@login_required(login_url='login')
def add_supplier(request):
    """Add a new supplier."""
    if request.method == 'POST':
        Suppliers.objects.create(
            Name=request.POST.get('Name'),
            Contact=request.POST.get('Contact'),
            Phone=request.POST.get('Phone'),
            Email=request.POST.get('Email'),
            City=request.POST.get('City'),
            Address=request.POST.get('Address')
        )
        messages.success(request, "Supplier added successfully!")
    
    return redirect('suppliers')


@login_required(login_url='login')
def edit_supplier(request, id):
    """Edit an existing supplier."""
    supplier = get_object_or_404(Suppliers, pk=id)
    
    if request.method == 'POST':
        supplier.Name = request.POST.get('Name')
        supplier.Contact = request.POST.get('Contact')
        supplier.Phone = request.POST.get('Phone')
        supplier.Email = request.POST.get('Email')
        supplier.City = request.POST.get('City')
        supplier.Address = request.POST.get('Address')
        supplier.save()
        messages.success(request, "Supplier updated successfully!")
    
    return redirect('suppliers')


@login_required(login_url='login')
def delete_supplier(request, id):
    """Delete a supplier."""
    supplier = get_object_or_404(Suppliers, pk=id)
    supplier.delete()
    messages.success(request, "Supplier deleted successfully!")
    return redirect('suppliers')


# ==================== Sales ====================

@login_required(login_url='login')
def sales(request):
    """Display all sales records."""
    context = {
        'all_sales': Sales.objects.all().order_by('-Number'),
        'all_medicines': Medicines.objects.all()
    }
    return render(request, "sales.html", context)


@login_required(login_url='login')
def add_sale(request):
    """Record a new sale."""
    if request.method == 'POST':
        med_id = request.POST.get('medicine_id')
        qty = int(request.POST.get('Sold'))
        customer = request.POST.get('Customer')
        medicine = get_object_or_404(Medicines, pk=med_id)
        
        # Check stock availability
        if medicine.Quantity >= qty:
            Sales.objects.create(
                medicine=medicine,
                Sold=qty,
                Customer=customer
            )
            messages.success(request, "Sale recorded successfully!")
        else:
            messages.error(request, f"Error: Not enough stock! Available: {medicine.Quantity}")
    
    return redirect('sales')


@login_required(login_url='login')
def delete_sale(request, id):
    """Delete a sale and restore stock."""
    sale = get_object_or_404(Sales, pk=id)
    
    # Restore the quantity to stock
    sale.medicine.Quantity += sale.Sold
    sale.medicine.save()
    
    sale.delete()
    messages.success(request, "Sale deleted successfully!")
    return redirect('sales')
