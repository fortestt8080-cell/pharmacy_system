from django.db import models
from django.core.exceptions import ValidationError # تم إضافة هذه المكتبة لإظهار رسائل الخطأ
from django.contrib.auth.models import AbstractUser

# 1. جدول الموردين (Suppliers)
class Suppliers(models.Model):
    Name = models.CharField(null=False, max_length=30, verbose_name='Supplier Name')
    Contact = models.CharField(null=False, max_length=20, verbose_name='Contact Person')
    Phone = models.CharField(unique=True, max_length=15, verbose_name='Phone Number')
    Email = models.EmailField(unique=True, max_length=50)
    City = models.CharField(null=False, max_length=15)
    Address = models.TextField(null=True, max_length=200)
    Contract = models.DateField(verbose_name='Contract Date',auto_now_add=True)

    def __str__(self):
        return self.Name

    class Meta:
        db_table = 'Suppliers'
        verbose_name_plural = 'Suppliers'


# 2. جدول الأدوية (Medicines)
class Medicines(models.Model):
    Number = models.AutoField(primary_key=True, verbose_name='No.')
    Name = models.CharField(null=False, max_length=30, verbose_name='Medicine Name')
    Code = models.CharField(null=False, max_length=50, unique=True)
    Category_choices=[
        ('Tablets','Tablets'),
        ('Syrup','Syrup'),
        ('Injections','Injections'),
        ('Capsules','Capsules'),
        ('Effervescent','Effervescent Tablets'),
        ('Suppositories','Suppositories'),
        ('Cream','Cream'),
        ('Ointment','Ointment'),
    ]
    Category = models.CharField(null=True, choices=Category_choices, max_length=25)
    Quantity = models.PositiveIntegerField(default=0)
    MinStock = models.PositiveIntegerField(default=0, verbose_name='Minimum Stock Level')
    Price = models.PositiveIntegerField(default=0, verbose_name='Unit Price')
    Expiry = models.DateField(verbose_name='Expiry Date')
    
    suppliers = models.ManyToManyField(Suppliers, related_name='medicines', verbose_name='Suppliers')

    def __str__(self):
        return self.Name

    class Meta:
        db_table = 'Medicines'
        verbose_name_plural = 'Medicines'


# 3. جدول تفاصيل الدواء
class MedicineDetails(models.Model):
    medicine = models.OneToOneField(Medicines, on_delete=models.CASCADE, primary_key=True, verbose_name='Medicine', blank=True)
    description = models.TextField(verbose_name='Scientific Description', null=True, blank=True)
    side_effects = models.TextField(verbose_name='Side Effects', null=True, blank=True)
    Box_Shape = models.FileField(null=True, upload_to='document/', verbose_name='Medicine Image', blank=True)

    def __str__(self):
        return f"Details for {self.medicine.Name}"
    
    class Meta:
        db_table = 'MedicineDetails'
        verbose_name_plural = 'MedicineDetails'


# 4. جدول المبيعات (Sales) - (تم التعديل هنا)
class Sales(models.Model):
    Number = models.AutoField(primary_key=True, verbose_name='Transaction ID')
    medicine = models.ForeignKey(Medicines, on_delete=models.CASCADE, verbose_name='Medicine Name')
    Sold = models.PositiveIntegerField(null=False, verbose_name='Quantity Sold')
    
    # جعلنا سعر الوحدة غير قابل للتعديل يدوياً لأنه سيؤخذ من الدواء تلقائياً
    Unit_Price = models.PositiveIntegerField(null=False, verbose_name='Unit Price', editable=False) 
    Total = models.PositiveIntegerField(null=False, editable=False)
    Date = models.DateField(auto_now_add=True, verbose_name='Sale Date')
    Customer = models.CharField(null=False, max_length=100, verbose_name='Customer Name')

    # دالة التحقق (Validation): تمنع البيع إذا كانت الكمية غير كافية
    def clean(self):
        # التأكد من اختيار دواء أولاً
        if not self.medicine_id:
            return
            
        # فحص إذا كانت الكمية المطلوبة أكبر من المتوفرة
        if self.Sold > self.medicine.Quantity:
            raise ValidationError(f"Sorry, this quantity is out of stock! Currently available in the warehouse {self.medicine.Quantity} just.")

    # دالة الحفظ: تحسب السعر وتخصم من المخزون
    def save(self, *args, **kwargs):
        # 1. جلب سعر الوحدة تلقائياً من جدول الأدوية
        self.Unit_Price = self.medicine.Price
        
        # 2. حساب الإجمالي
        self.Total = self.Sold * self.Unit_Price
        
        # 3. خصم الكمية من المخزون (فقط عند إنشاء عملية بيع جديدة)
        if not self.pk: 
            self.medicine.Quantity -= self.Sold
            self.medicine.save() # حفظ التعديل في جدول الأدوية
            
        super(Sales, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.medicine.Name} - {self.Date}"

    class Meta:
        db_table = 'Sales'
        verbose_name_plural = 'Sales'


class User(AbstractUser):
    phone=models.CharField(null=True,max_length=20)

    def __str__(self):
        return self.username