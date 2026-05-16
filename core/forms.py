from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Listing


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    city = forms.CharField(max_length=100, required=False, label='Grad')

    class Meta:
        model = User
        fields = ('username', 'email', 'city', 'password1', 'password2')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Korisnik sa ovim emailom već postoji.')
        return email


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class ListingForm(forms.ModelForm):
    images = forms.FileField(
        widget=MultipleFileInput(),
        required=False,
        label='Fotografije'
    )

    class Meta:
        model = Listing
        fields = ('title', 'description', 'category', 'condition', 'wants', 'city')
        labels = {
            'title': 'Naslov',
            'description': 'Opis',
            'category': 'Kategorija',
            'condition': 'Stanje',
            'wants': 'Šta tražiš u zamenu?',
            'city': 'Grad',
        }
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }